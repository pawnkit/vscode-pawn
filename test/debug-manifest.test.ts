import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

test("declares the supported launch contract", () => {
  const manifest = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  const debuggerContribution = manifest.contributes.debuggers.find((item: { type: string }) => item.type === "pawn");
  assert.ok(debuggerContribution);
  assert.deepEqual(Object.keys(debuggerContribution.configurationAttributes), ["launch"]);
  assert.deepEqual(debuggerContribution.configurationAttributes.launch.required, ["program"]);
  assert.equal(debuggerContribution.program, undefined);
  assert.equal(debuggerContribution.runtime, undefined);
});

test("exposes released CLI and tool management commands", () => {
  const manifest = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  const commands = manifest.contributes.commands
    .map((item: { command: string }) => item.command)
    .filter((command: string) => !command.startsWith("pawn.restart") && command !== "pawn.showOutput");
  assert.deepEqual(commands, ["pawn.setupProject", "pawn.showProjectHealth", "pawn.check", "pawn.fmt", "pawn.lint", "pawn.doctor", "pawn.build", "pawn.installTools", "pawn.showToolVersions"]);
  assert.deepEqual(manifest.contributes.taskDefinitions[0].properties.task.enum, ["check", "fmt", "lint", "doctor", "build"]);
});
