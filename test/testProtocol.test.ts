import assert from "node:assert/strict";
import test from "node:test";
import { formatTestResult, parseTestReport, testRunArgs } from "../src/testProtocol";

test("builds an exact pawntest run filter", () => {
  assert.deepEqual(testRunArgs([
    { name: "test_adds", file: "tests/math.test.pwn" },
    { name: "test_value[0]", file: "tests/math.test.pwn" },
  ]), [
    "test", "tests/math.test.pwn", "--format", "json", "--run", "^(?:test_adds|test_value\\[0\\])$",
  ]);
});

test("reads pawntest JSON results", () => {
  const report = parseTestReport('{"results":[{"name":"test_adds","status":"pass","duration_ms":2}]}');
  assert.equal(report.results[0]?.name, "test_adds");
});

test("formats a concise test result", () => {
  assert.equal(formatTestResult({
    name: "test_adds",
    status: "fail",
    message: "expected 42",
    warnings: ["slow test"],
    duration_ms: 3,
  }, "adds"), "FAIL adds (3ms)\r\n  expected 42\r\n  warning: slow test\r\n");
});
