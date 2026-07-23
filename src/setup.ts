import * as vscode from "vscode";
import { relative } from "node:path";
import { run } from "./process";
import { ToolManager } from "./toolManager";

export async function setupProject(tools: ToolManager): Promise<boolean> {
  if (!vscode.workspace.isTrusted) {
    void vscode.window.showWarningMessage("Trust this workspace before setting up PawnKit.");
    return false;
  }
  const folder = await chooseFolder();
  if (!folder) return false;
  const entries = await vscode.workspace.findFiles(
    new vscode.RelativePattern(folder, "**/*.pwn"),
    "**/{.git,dependencies,node_modules,vendor,generated}/**",
    1001
  );
  if (entries.length === 0) {
    void vscode.window.showErrorMessage("No .pwn files were found in this workspace.");
    return false;
  }
  if (entries.length > 1000) {
    void vscode.window.showErrorMessage("Too many .pwn files were found. Run pawn init with --entry instead.");
    return false;
  }
  const entry = await chooseEntry(folder, entries);
  if (!entry) return false;
  const target = await vscode.window.showQuickPick([
    { label: "open.mp", value: "openmp", description: "Use the open.mp target profile" },
    { label: "SA-MP", value: "samp", description: "Use the SA-MP target profile" }
  ], { title: "Choose the project target" });
  if (!target) return false;
  const includes = await existingDirectories(folder, ["include", "includes", "pawno/include"]);
  const config = vscode.workspace.getConfiguration("pawn.cli", folder.uri);
  const executable = await tools.resolve("pawn", config.get<string>("path"), folder.uri.fsPath);
  const args = ["init", "--project", folder.uri.fsPath, "--entry", workspacePath(folder, entry), "--target", target.value];
  for (const include of includes) args.push("--include", include);
  const result = await run(executable, args, folder.uri.fsPath);
  if (result.code !== 0) throw new Error((result.stderr || result.stdout).trim() || "Project setup failed.");
  const manifest = vscode.Uri.joinPath(folder.uri, "pawn.json");
  await vscode.window.showTextDocument(manifest);
  void vscode.window.showInformationMessage("PawnKit project created.");
  return true;
}

async function chooseFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length === 1) return folders[0];
  if (folders.length === 0) {
    void vscode.window.showErrorMessage("Open a workspace before setting up PawnKit.");
    return undefined;
  }
  const selected = await vscode.window.showQuickPick(folders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })), {
    title: "Choose a Pawn project"
  });
  return selected?.folder;
}

async function chooseEntry(folder: vscode.WorkspaceFolder, entries: vscode.Uri[]): Promise<vscode.Uri | undefined> {
  const active = vscode.window.activeTextEditor?.document;
  if (active?.languageId === "pawn" && entries.some((entry) => entry.toString() === active.uri.toString())) return active.uri;
  if (entries.length === 1) return entries[0];
  const selected = await vscode.window.showQuickPick(entries.map((entry) => ({ label: workspacePath(folder, entry), entry })), {
    title: "Choose the project entry file",
    matchOnDescription: true
  });
  return selected?.entry;
}

async function existingDirectories(folder: vscode.WorkspaceFolder, candidates: string[]): Promise<string[]> {
  const found: string[] = [];
  for (const candidate of candidates) {
    try {
      const stat = await vscode.workspace.fs.stat(vscode.Uri.joinPath(folder.uri, ...candidate.split("/")));
      if ((stat.type & vscode.FileType.Directory) !== 0) found.push(candidate);
    } catch {
      // Missing conventional include directories are fine.
    }
  }
  return found;
}

function workspacePath(folder: vscode.WorkspaceFolder, uri: vscode.Uri): string {
  return relative(folder.uri.fsPath, uri.fsPath).replace(/\\/g, "/");
}
