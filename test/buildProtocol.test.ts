import assert from "node:assert/strict";
import test from "node:test";
import { readBuildReport } from "../src/buildProtocol";

test("reads build diagnostics and artifacts", () => {
  const report = readBuildReport(JSON.stringify({
    kind: "result",
    schemaVersion: 2,
    status: "failed",
    diagnostics: [{
      schemaVersion: 2,
      code: "pawncc-017",
      source: "pawncc",
      severity: "error",
      message: "undefined symbol",
      primary: {
        uri: "file:///project/main.pwn",
        range: { start: { line: 4, character: 0 }, end: { line: 4, character: 1 } }
      }
    }],
    artifacts: []
  }));
  assert.equal(report.diagnostics[0]?.code, "pawncc-017");
});

test("rejects unsupported and malformed build reports", () => {
  assert.throws(() => readBuildReport('{"kind":"result","schemaVersion":1}'), /Unsupported/);
  assert.throws(() => readBuildReport('{"kind":"result","schemaVersion":2,"status":"passed","diagnostics":null,"artifacts":[]}'), /Invalid/);
});
