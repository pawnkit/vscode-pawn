import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { bundledTools, expectedChecksum, managedIncludeRoot, managedToolReady, releaseAsset, sha256, ToolDefinition, tools } from "../src/tooling";

test("selects the release archive for the current target", () => {
  const assets = [
    { name: "pawntest_Darwin_arm64.tar.gz", browser_download_url: "arm" },
    { name: "pawntest_Windows_x86_64.zip", browser_download_url: "windows" }
  ];
  assert.equal(releaseAsset(assets, "win32", "x64")?.browser_download_url, "windows");
  assert.equal(releaseAsset(assets, "darwin", "arm64")?.browser_download_url, "arm");
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
  assert.equal(tools.find(({ binary }) => binary === "pawnlsp")?.version, "v0.11.0");
  assert.equal(tools.find(({ binary }) => binary === "pawn")?.version, "v1.1.0");
  assert.equal(tools.find(({ binary }) => binary === "pawntest")?.version, "v1.1.3");
  assert.deepEqual(bundledTools.map(({ label, provider }) => [label, provider]), [
    ["Pawn formatter", "pawnlsp"],
    ["Pawn linter", "pawnlsp"]
  ]);
  assert.equal(bundledTools.find(({ label }) => label === "Pawn formatter")?.version, "v1.3.4");
  assert.equal(bundledTools.find(({ label }) => label === "Pawn linter")?.version, "v1.1.1");
});
