import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { bundledTools, expectedChecksum, managedIncludeRoot, managedToolReady, releaseDownloads, sha256, testedReleaseSet, ToolDefinition, tools } from "../src/tooling";

test("builds pinned release download URLs", () => {
  const server: ToolDefinition = { binary: "pawnlsp", label: "Pawn language server", repository: "pawnlsp", version: "v0.33.3" };
  assert.equal(releaseDownloads(server, "win32", "x64")?.filename, "pawnlsp_0.33.3_windows_amd64.zip");
  assert.equal(releaseDownloads(server, "darwin", "arm64")?.filename, "pawnlsp_0.33.3_darwin_arm64.tar.gz");

  const cli: ToolDefinition = { binary: "pawn", label: "PawnKit CLI", repository: "pawnkit-cli", version: "v1.3.1" };
  assert.equal(releaseDownloads(cli, "linux", "x64")?.filename, "pawn-linux-amd64.tar.gz");
});

test("matches GoReleaser checksums", () => {
  const digest = sha256(Buffer.from("pawn"));
  assert.equal(expectedChecksum(`${digest}  pawn-linux-amd64.tar.gz\n`, "pawn-linux-amd64.tar.gz"), digest);
  assert.equal(expectedChecksum(`${digest}  another-file.zip\n`, "pawn-linux-amd64.tar.gz"), undefined);
});

test("uses managed includes only after extraction", () => {
  const root = join("tools", "pawntest", "v1.1.2");
  const executable = join(root, "pawntest");
  assert.equal(managedIncludeRoot(executable, (path) => path === join(root, "include", "pawntest.inc")), join(root, "include"));
  assert.equal(managedIncludeRoot(executable, () => false), undefined);
});

test("does not replace a complete managed installation", () => {
  const executable = join("tools", "pawnlsp", "v0.9.9", "pawnlsp.exe");
  const tool: ToolDefinition = { binary: "pawnlsp", label: "Pawn language server", repository: "pawnlsp", version: "v0.9.9" };
  assert.equal(managedToolReady(tool, executable, (path) => path === executable), true);
  assert.equal(managedToolReady(tool, executable, () => false), false);
});

test("repairs pawntest when managed includes are missing", () => {
  const root = join("tools", "pawntest", "v1.1.2");
  const executable = join(root, "pawntest.exe");
  const tool: ToolDefinition = { binary: "pawntest", label: "Pawn test runner", repository: "pawntest", version: "v1.1.2" };
  assert.equal(managedToolReady(tool, executable, (path) => path === executable), false);
  assert.equal(managedToolReady(tool, executable, (path) => path === executable || path === join(root, "include", "pawntest.inc")), true);
});

test("reports tools bundled with the language server", () => {
	assert.equal(testedReleaseSet.id, "toolchain-signed-2026-08-03-24");
	assert.equal(testedReleaseSet.url, "https://pawnkit.dev/release-sets/toolchain-signed-2026-08-03-24.json");
	assert.equal(tools.find(({ binary }) => binary === "pawnlsp")?.version, "v0.34.29");
	assert.equal(tools.find(({ binary }) => binary === "pawn")?.version, "v1.34.26");
  assert.equal(tools.find(({ binary }) => binary === "pawntest")?.version, "v1.2.11");
  assert.deepEqual(bundledTools.map(({ label, provider }) => [label, provider]), [
    ["Pawn formatter", "pawnlsp"],
    ["Pawn linter", "pawnlsp"]
  ]);
  assert.equal(bundledTools.find(({ label }) => label === "Pawn formatter")?.version, "v1.4.10");
  assert.equal(bundledTools.find(({ label }) => label === "Pawn linter")?.version, "v1.8.46");
});
