import assert from "node:assert/strict";
import test from "node:test";
import { findTopLevelMain, SymbolNode } from "../src/entryPoint";

interface Range {
  line: number;
}

test("finds a top-level main function", () => {
  const symbols: SymbolNode<Range>[] = [
    { name: "helper", kind: 11, range: { line: 2 } },
    { name: "main", kind: 11, range: { line: 8 } }
  ];

  assert.deepEqual(findTopLevelMain(symbols, 11), { line: 8 });
});

test("ignores non-function and nested main symbols", () => {
  const symbols: SymbolNode<Range>[] = [
    {
      name: "outer",
      kind: 11,
      range: { line: 2 },
      children: [{ name: "main", kind: 11, range: { line: 3 } }]
    },
    { name: "main", kind: 12, range: { line: 8 } }
  ];

  assert.equal(findTopLevelMain(symbols, 11), undefined);
});
