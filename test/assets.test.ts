import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function readJSON(path: string): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), path), "utf8"));
}

test("extension assets contain valid JSON", () => {
  const paths = [
    "language-configuration.json",
    "syntaxes/pawn.tmLanguage.json",
    "schemas/pawn.schema.json",
    "schemas/pawn-lock.schema.json",
    "schemas/pawnlint.schema.json",
  ];

  for (const path of paths) {
    assert.doesNotThrow(() => readJSON(path), path);
  }
});

test("grammar includes Pawn-specific syntax", () => {
  const grammar = readJSON("syntaxes/pawn.tmLanguage.json") as {
    patterns: Array<{ begin?: string; match?: string; name?: string }>;
  };
  const patterns = grammar.patterns.flatMap(({ begin, match, name }) => [begin ?? "", match ?? "", name ?? ""]).join("\n");

  assert.match(patterns, /tryinclude/);
  assert.match(patterns, /endinput/);
  assert.match(patterns, /keyword\.control\.directive\.conditional\.pawn/);
  assert.match(patterns, /defined.*A-Za-z_@/);
});
