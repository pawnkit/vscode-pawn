import assert from "node:assert/strict";
import test from "node:test";
import { run } from "../src/process";

test("captures tool output and exit status", async () => {
  const result = await run(process.execPath, ["-e", "process.stdout.write('out'); process.stderr.write('err'); process.exit(2)"]);
  assert.deepEqual(result, { code: 2, stdout: "out", stderr: "err" });
});

test("bounds combined stdout and stderr", async () => {
  await assert.rejects(
    run(process.execPath, ["-e", "process.stdout.write('a'.repeat(600)); process.stderr.write('b'.repeat(600))"], undefined, 1000),
    /output exceeded/
  );
});
