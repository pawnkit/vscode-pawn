import assert from "node:assert/strict";
import test from "node:test";
import { parseTestReport, testRunArgs } from "../src/testProtocol";

test("builds an exact pawntest run filter", () => {
  assert.deepEqual(testRunArgs(["test_adds", "test_value[0]"]), [
    "test", "--format", "json", "--run", "^(?:test_adds|test_value\\[0\\])$",
  ]);
});

test("reads pawntest JSON results", () => {
  const report = parseTestReport('{"results":[{"name":"test_adds","status":"pass","duration_ms":2}]}');
  assert.equal(report.results[0]?.name, "test_adds");
});
