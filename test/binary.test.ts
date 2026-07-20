import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { candidates, executableName, resolveBinary } from "../src/binary";

test("adds the Windows executable suffix", () => {
  assert.equal(executableName("pawnlsp", "win32"), "pawnlsp.exe");
  assert.equal(executableName("pawnlsp.exe", "win32"), "pawnlsp.exe");
  assert.equal(executableName("pawnlsp", "linux"), "pawnlsp");
});

test("resolves configured relative paths from the workspace", () => {
  assert.deepEqual(candidates({ name: "pawnlsp", configured: "tools/pawnlsp", workspace: "/project", platform: "linux" }), ["/project/tools/pawnlsp"]);
});

test("uses PATH entries", () => {
  const result = candidates({ name: "pawn", path: "/one:/two", platform: "linux" });
  assert.deepEqual(result, ["/one/pawn", "/two/pawn"]);
});

test("uses the target platform PATH delimiter", () => {
  const result = candidates({ name: "pawn", path: "C:\\one;D:\\two", platform: "win32" });
  assert.deepEqual(result, ["C:\\one\\pawn.exe", "D:\\two\\pawn.exe"]);
});

test("uses a managed binary after PATH", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pawn-tools-"));
  const managed = join(directory, "pawnlsp");
  await writeFile(managed, "");
  assert.equal(await resolveBinary({ name: "pawnlsp", path: "", managed, platform: "win32" }), managed);
});

test("does not replace an invalid configured path with a managed binary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pawn-tools-"));
  const managed = join(directory, "pawnlsp");
  await writeFile(managed, "");
  await assert.rejects(resolveBinary({ name: "pawnlsp", configured: "/missing/pawnlsp", managed, platform: "linux" }));
});
