import assert from "node:assert/strict";
import test from "node:test";
import { readDoctorReport } from "../src/healthProtocol";

test("reads a supported doctor report", () => {
  const report = readDoctorReport(JSON.stringify({ schemaVersion: 1, findings: [{
    id: "entry-missing", severity: "error", certainty: "confirmed", source: "pawn-project", message: "entry is missing"
  }] }));
  assert.equal(report.findings[0]?.id, "entry-missing");
});

test("rejects unsupported doctor reports", () => {
  assert.throws(() => readDoctorReport('{"schemaVersion":2,"findings":[]}'), /Unsupported/);
  assert.throws(() => readDoctorReport('{"schemaVersion":1,"findings":[{}]}'), /Invalid/);
});
