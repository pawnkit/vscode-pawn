import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { replaceFile } from "../src/replaceFile";

test("replaces a file and removes its backup", async () => {
  const root = await mkdtemp(join(tmpdir(), "pawn-replace-"));
  const destination = join(root, "tool");
  const temporary = `${destination}.tmp`;
  await writeFile(destination, "old");
  await writeFile(temporary, "new");

  await replaceFile(destination, temporary);

  assert.equal(await readFile(destination, "utf8"), "new");
  await assert.rejects(readFile(`${destination}.bak`));
});

test("installs a file when no previous version exists", async () => {
  const root = await mkdtemp(join(tmpdir(), "pawn-replace-"));
  const destination = join(root, "tool");
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, "new");

  await replaceFile(destination, temporary);

  assert.equal(await readFile(destination, "utf8"), "new");
});
