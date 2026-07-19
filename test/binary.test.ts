import assert from "node:assert/strict";
import test from "node:test";
import { candidates, executableName } from "../src/binary";

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
