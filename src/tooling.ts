import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";

export interface ToolDefinition {
  binary: string;
  label: string;
  repository: string;
  version: string;
}

export const testedReleaseSet = {
  id: "toolchain-signed-2026-08-01-7",
  url: "https://pawnkit.dev/release-sets/toolchain-signed-2026-08-01-7.json",
  versions: {
    pawn: "v1.34.1",
    pawnfmt: "v1.4.4",
    pawnlint: "v1.8.16",
    pawnlsp: "v0.33.80",
    pawntest: "v1.2.5"
  }
} as const;

export const managedVersions = testedReleaseSet.versions;

export const tools: readonly ToolDefinition[] = [
  { binary: "pawnlsp", label: "Pawn language server", repository: "pawnlsp", version: managedVersions.pawnlsp },
  { binary: "pawn", label: "PawnKit CLI", repository: "pawnkit-cli", version: managedVersions.pawn },
  { binary: "pawntest", label: "Pawn test runner", repository: "pawntest", version: managedVersions.pawntest },
  { binary: "pawndebug", label: "Pawn debugger", repository: "pawndebug", version: "v0.2.2" }
];

export interface BundledToolDefinition {
  label: string;
  provider: string;
  version: string;
}

export const bundledTools: readonly BundledToolDefinition[] = [
  { label: "Pawn formatter", provider: "pawnlsp", version: managedVersions.pawnfmt },
  { label: "Pawn linter", provider: "pawnlsp", version: managedVersions.pawnlint }
];

export function managedIncludeRoot(executable: string, exists: (path: string) => boolean): string | undefined {
  const root = join(dirname(executable), "include");
  return exists(join(root, "pawntest.inc")) ? root : undefined;
}

export function managedToolReady(tool: ToolDefinition, executable: string, exists: (path: string) => boolean): boolean {
  if (!exists(executable)) return false;
  return tool.binary !== "pawntest" || managedIncludeRoot(executable, exists) !== undefined;
}

export interface ReleaseDownloads {
  archive: string;
  checksum: string;
  filename: string;
}

export function releaseDownloads(tool: ToolDefinition, platform: NodeJS.Platform, arch: string): ReleaseDownloads | undefined {
  const os = platform === "win32" ? "windows" : platform === "darwin" ? "darwin" : platform === "linux" ? "linux" : "";
  const architecture = arch === "x64" ? "amd64" : arch === "arm64" ? "arm64" : "";
  if (!os || !architecture) return undefined;
  const version = tool.version.replace(/^v/, "");
  const filename = tool.repository === "pawnkit-cli"
    ? `pawn-${os}-${architecture}.tar.gz`
    : `${tool.binary}_${version}_${os}_${architecture}.${platform === "win32" ? "zip" : "tar.gz"}`;
  const base = `https://github.com/pawnkit/${tool.repository}/releases/download/${tool.version}`;
  return { archive: `${base}/${filename}`, checksum: `${base}/checksums.txt`, filename };
}

export function expectedChecksum(document: string, filename: string): string | undefined {
  for (const line of document.split(/\r?\n/)) {
    const match = /^([a-fA-F0-9]{64})\s+\*?(.+)$/.exec(line.trim());
    if (match?.[2] === filename) return match[1]?.toLowerCase();
  }
  return undefined;
}

export function sha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function extractTarGz(data: Uint8Array, binary: string): Buffer {
  const entry = tarGzEntries(data).find(({ name }) => [binary, `${binary}.exe`].includes(name.split("/").pop() ?? ""));
  if (entry) return entry.data;
  throw new Error(`${binary} was not found in the release archive`);
}

export interface ArchiveEntry { name: string; data: Buffer; }

export function tarGzEntries(data: Uint8Array): ArchiveEntry[] {
  const archive = gunzipSync(data);
  if (archive.length > 200 * 1024 * 1024) throw new Error("release archive is too large");
  const entries: ArchiveEntry[] = [];
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const sizeText = header.subarray(124, 136).toString("ascii").replace(/\0.*$/, "").trim();
    const size = Number.parseInt(sizeText || "0", 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > archive.length) throw new Error("invalid release archive");
    if (name && header[156] !== 53) entries.push({ name, data: archive.subarray(offset + 512, offset + 512 + size) });
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}
