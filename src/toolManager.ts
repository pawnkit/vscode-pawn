import * as vscode from "vscode";
import { existsSync } from "node:fs";
import { chmod, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import AdmZip = require("adm-zip");
import { executableName, resolveBinary } from "./binary";
import { ArchiveEntry, expectedChecksum, extractTarGz, managedIncludeRoot, releaseAsset, sha256, tarGzEntries, ToolDefinition, tools } from "./tooling";

interface GitHubRelease { assets: { name: string; browser_download_url: string }[]; }

export class ToolManager implements vscode.Disposable {
  private readonly installEmitter = new vscode.EventEmitter<string>();
  readonly onDidInstall = this.installEmitter.event;

  constructor(private readonly context: vscode.ExtensionContext, private readonly output: vscode.LogOutputChannel) {}

  dispose(): void { this.installEmitter.dispose(); }

  async resolve(binary: string, configured: string | undefined, workspace: string | undefined, prompt = true): Promise<string> {
    const definition = tools.find((tool) => tool.binary === binary);
    if (!definition) throw new Error(`Unknown PawnKit tool: ${binary}`);
    try {
      return await resolveBinary({ configured, name: binary, workspace, managed: this.path(definition) });
    } catch (error) {
      if (!prompt) throw error;
    }
    const choice = await vscode.window.showInformationMessage(
      `${definition.label} is required for this feature. Install ${definition.version}?`,
      "Install",
      "Open Settings"
    );
    if (choice === "Open Settings") {
      await vscode.commands.executeCommand("workbench.action.openSettings", `pawn.${setting(binary)}.path`);
      throw new Error(`${definition.label} is not installed.`);
    }
    if (choice !== "Install") throw new Error(`${definition.label} is not installed.`);
    return this.install(definition);
  }

  async find(binary: string, configured: string | undefined, workspace: string | undefined): Promise<string | undefined> {
    try {
      return await this.resolve(binary, configured, workspace, false);
    } catch {
      return undefined;
    }
  }

  async chooseAndInstall(): Promise<void> {
    const selected = await vscode.window.showQuickPick(
      tools.map((tool) => ({ label: tool.label, description: tool.version, tool, picked: true })),
      { canPickMany: true, placeHolder: "Choose PawnKit tools to install or update" }
    );
    if (!selected?.length) return;
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: "Installing PawnKit tools" }, async (progress) => {
      for (const [index, item] of selected.entries()) {
        progress.report({ message: item.label, increment: 100 / selected.length });
        await this.install(item.tool);
        this.output.info(`Installed ${item.tool.binary} ${item.tool.version}`);
        if (index === selected.length - 1) progress.report({ increment: 0 });
      }
    });
    void vscode.window.showInformationMessage("PawnKit tools are ready.");
  }

  async showVersions(): Promise<void> {
    const lines = await Promise.all(tools.map(async (tool) => {
      try {
        const resolved = await resolveBinary({ name: tool.binary, managed: this.path(tool) });
        const version = resolved === this.path(tool) ? tool.version : "external version";
        return `${tool.label}: ${version} (${resolved})`;
      } catch {
        return `${tool.label}: not installed`;
      }
    }));
    void vscode.window.showInformationMessage(lines.join("\n"), { modal: true });
  }

  includePaths(): string[] {
    const pawntest = tools.find((tool) => tool.binary === "pawntest");
    if (!pawntest) return [];
    const root = managedIncludeRoot(this.path(pawntest), existsSync);
    return root ? [root] : [];
  }

  private path(tool: ToolDefinition): string {
    return join(this.context.globalStorageUri.fsPath, "tools", tool.binary, tool.version, executableName(tool.binary));
  }

  private async install(tool: ToolDefinition): Promise<string> {
    if (!vscode.workspace.isTrusted) throw new Error("Trust this workspace before installing PawnKit tools.");
    const release = await json<GitHubRelease>(`https://api.github.com/repos/pawnkit/${tool.repository}/releases/tags/${tool.version}`);
    const asset = releaseAsset(release.assets, process.platform, process.arch);
    const checksums = release.assets.find((candidate) => candidate.name === "checksums.txt");
    if (!asset || !checksums) throw new Error(`${tool.label} ${tool.version} has no release for ${process.platform}/${process.arch}.`);
    const [archive, checksumDocument] = await Promise.all([download(asset.browser_download_url), text(checksums.browser_download_url)]);
    const expected = expectedChecksum(checksumDocument, asset.name);
    if (!expected || sha256(archive) !== expected) throw new Error(`Checksum verification failed for ${asset.name}.`);
    const entries = asset.name.endsWith(".zip") ? zipEntries(archive) : tarGzEntries(archive);
    const executable = asset.name.endsWith(".zip") ? archiveBinary(entries, tool.binary) : extractTarGz(archive, tool.binary);
    const destination = this.path(tool);
    const temporary = `${destination}.tmp`;
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(temporary, executable, { mode: 0o755 });
    if (process.platform !== "win32") await chmod(temporary, 0o755);
    await rm(destination, { force: true });
    await rename(temporary, destination);
    if (tool.binary === "pawntest") {
      await writeIncludes(dirname(destination), entries);
    }
    this.installEmitter.fire(tool.binary);
    return destination;
  }
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { "User-Agent": "vscode-pawn", Accept: "application/octet-stream" } });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > 200 * 1024 * 1024) throw new Error("Release archive is too large.");
  const result = Buffer.from(await response.arrayBuffer());
  if (result.length > 200 * 1024 * 1024) throw new Error("Release archive is too large.");
  return result;
}

async function text(url: string): Promise<string> { return (await download(url)).toString("utf8"); }

async function json<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { "User-Agent": "vscode-pawn", Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`Release lookup failed: HTTP ${response.status}`);
  return await response.json() as T;
}

function zipEntries(data: Uint8Array): ArchiveEntry[] {
  const archive = new AdmZip(Buffer.from(data));
  let size = 0;
  return archive.getEntries().filter(({ isDirectory }) => !isDirectory).map((entry) => {
    size += entry.header.size;
    if (size > 200 * 1024 * 1024) throw new Error("release archive is too large");
    return { name: entry.entryName, data: entry.getData() };
  });
}

function archiveBinary(entries: readonly ArchiveEntry[], binary: string): Buffer {
  const entry = entries.find(({ name }) => [binary, `${binary}.exe`].includes(name.split("/").pop() ?? ""));
  if (!entry) throw new Error(`${binary} was not found in the release archive`);
  return entry.data;
}

async function writeIncludes(root: string, entries: readonly ArchiveEntry[]): Promise<void> {
  await rm(join(root, "include"), { recursive: true, force: true });
  for (const entry of entries) {
    const parts = entry.name.replace(/\\/g, "/").split("/").filter(Boolean);
    const include = parts.indexOf("include");
    if (include < 0 || !parts.at(-1)?.endsWith(".inc") || parts.slice(include).some((part) => part === "." || part === "..")) continue;
    const destination = join(root, ...parts.slice(include));
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, entry.data, { mode: 0o644 });
  }
}

function setting(binary: string): string {
  if (binary === "pawnlsp") return "server";
  if (binary === "pawndebug") return "debug";
  if (binary === "pawntest") return "test";
  return "cli";
}
