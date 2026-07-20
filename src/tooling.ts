import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

export interface ToolDefinition {
  binary: string;
  label: string;
  repository: string;
  version: string;
}

export const tools: readonly ToolDefinition[] = [
  { binary: "pawnlsp", label: "Pawn language server", repository: "pawnlsp", version: "v0.1.1" },
  { binary: "pawn", label: "PawnKit CLI", repository: "pawnkit-cli", version: "v1.0.0" },
  { binary: "pawntest", label: "Pawn test runner", repository: "pawntest", version: "v1.1.0" },
  { binary: "pawndebug", label: "Pawn debugger", repository: "pawndebug", version: "v0.1.0" }
];

export interface ReleaseAsset { name: string; browser_download_url: string; }

export function releaseAsset(assets: readonly ReleaseAsset[], platform: NodeJS.Platform, arch: string): ReleaseAsset | undefined {
  const os = platform === "win32" ? "windows" : platform === "darwin" ? "darwin" : platform === "linux" ? "linux" : "";
  const architectures = arch === "x64" ? ["amd64", "x86_64"] : arch === "arm64" ? ["arm64", "aarch64"] : [];
  if (!os || architectures.length === 0) return undefined;
  return assets.find(({ name }) => {
    const value = name.toLowerCase();
    return value.includes(os) && architectures.some((candidate) => value.includes(candidate)) && (value.endsWith(".zip") || value.endsWith(".tar.gz"));
  });
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
  const archive = gunzipSync(data);
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const sizeText = header.subarray(124, 136).toString("ascii").replace(/\0.*$/, "").trim();
    const size = Number.parseInt(sizeText || "0", 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > archive.length) throw new Error("invalid release archive");
    if (name.split("/").pop() === binary || name.split("/").pop() === `${binary}.exe`) return archive.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error(`${binary} was not found in the release archive`);
}
