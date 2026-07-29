import assert from "node:assert/strict";
import test from "node:test";
import { buildArgs, runArgs } from "../src/buildArgs";

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

test("runs through an RFC 0012 backend", () => {
  assert.deepEqual(runArgs({
    project: "examples/server",
    profile: "openmp",
    runtime: "server",
    backend: "sampctl",
    artifact: "build/server.amx"
  }), [
    "run",
    "--project", "examples/server",
    "--profile", "openmp",
    "--runtime", "server",
    "--backend", "sampctl",
    "--artifact", "build/server.amx"
  ]);
  assert.equal(runArgs({ compiler: "pawncc" }), undefined);
});
