import assert from "node:assert/strict";
import test from "node:test";
import { buildArgs } from "../src/buildArgs";

test("builds through the PawnKit CLI", () => {
  assert.deepEqual(buildArgs({
    project: "examples/server",
    profile: "openmp",
    build: "debug",
    runtime: "server",
    compiler: "compiler/pawncc",
    artifact: "build/server.amx"
  }), [
    "build",
    "--project", "examples/server",
    "--profile", "openmp",
    "--build", "debug",
    "--runtime", "server",
    "--compiler", "compiler/pawncc",
    "--artifact", "build/server.amx"
  ]);
});

test("requires one build provider", () => {
  assert.equal(buildArgs({}), undefined);
  assert.equal(buildArgs({ compiler: "pawncc", backend: "sampctl" }), undefined);
});
