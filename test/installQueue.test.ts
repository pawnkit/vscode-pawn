import assert from "node:assert/strict";
import test from "node:test";
import { InstallQueue } from "../src/installQueue";

test("serializes overlapping installs", async () => {
  const queue = new InstallQueue();
  const events: string[] = [];
  let release!: () => void;
  const first = queue.run(async () => {
    events.push("first:start");
    await new Promise<void>((resolve) => { release = resolve; });
    events.push("first:end");
    return "first";
  });
  const second = queue.run(async () => {
    events.push("second:start");
    return "second";
  });

  await Promise.resolve();
  assert.deepEqual(events, ["first:start"]);
  release();
  assert.equal(await first, "first");
  assert.equal(await second, "second");
  assert.deepEqual(events, ["first:start", "first:end", "second:start"]);
});

test("continues after a failed install", async () => {
  const queue = new InstallQueue();
  await assert.rejects(queue.run(async () => { throw new Error("failed"); }), /failed/);
  assert.equal(await queue.run(async () => "ready"), "ready");
});
