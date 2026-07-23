import assert from "node:assert/strict";
import test from "node:test";
import { initializationOptions, managedToolState } from "../src/lspProtocol";

test("builds versioned managed tool state", () => {
  const roots = ["/tools/pawntest/include"];
  assert.deepEqual(initializationOptions(roots), {
    pawnkit: { protocolVersion: 1, managedIncludeRoots: roots }
  });
  assert.deepEqual(managedToolState([]), {
    protocolVersion: 1, managedIncludeRoots: []
  });
});
