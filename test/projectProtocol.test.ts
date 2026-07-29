import assert from "node:assert/strict";
import test from "node:test";
import { readProjectReport } from "../src/projectProtocol";

test("reads a supported project report", () => {
  const report = readProjectReport(JSON.stringify({
    schemaVersion: 1,
    root: "/project",
    manifest: "/project/pawn.json",
    entry: "/project/main.pwn",
    profile: "openmp",
    build: "development",
    runtime: "local"
  }));
  assert.equal(report.profile, "openmp");
  assert.equal(report.build, "development");
});

test("rejects invalid project reports", () => {
  assert.throws(() => readProjectReport('{"schemaVersion":2}'), /Unsupported/);
  assert.throws(() => readProjectReport('{"schemaVersion":1,"root":1}'), /Invalid/);
});
