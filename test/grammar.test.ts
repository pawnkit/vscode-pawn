import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadWASM, OnigScanner, OnigString } from "vscode-oniguruma";
import { Registry } from "vscode-textmate";

type Grammar = {
  tokenizeLine(line: string, state?: unknown): {
    ruleStack: unknown;
    tokens: Array<{ startIndex: number; endIndex: number; scopes: string[] }>;
  };
};

async function loadGrammar(): Promise<Grammar> {
  const wasm = readFileSync(require.resolve("vscode-oniguruma/release/onig.wasm"));
  await loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
  const registry = new Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (sources) => new OnigScanner(sources),
      createOnigString: (source) => new OnigString(source),
    }),
    loadGrammar: async (scope) => {
      if (scope !== "source.pawn") {
        return null;
      }
      return JSON.parse(readFileSync("syntaxes/pawn.tmLanguage.json", "utf8"));
    },
  });
  const grammar = await registry.loadGrammar("source.pawn");
  assert.ok(grammar);
  return grammar as Grammar;
}

test("representative Pawn syntax uses conventional scopes", async () => {
  const grammar = await loadGrammar();
  const source = readFileSync("testdata/highlighting.pwn", "utf8");
  const tokens: Array<{ text: string; scopes: string[] }> = [];
  let state: unknown;

  for (const line of source.split("\n")) {
    const result = grammar.tokenizeLine(line, state);
    state = result.ruleStack;
    for (const token of result.tokens) {
      tokens.push({ text: line.slice(token.startIndex, token.endIndex), scopes: token.scopes });
    }
  }

  const expectScope = (text: string, scope: string) => {
    assert.ok(
      tokens.some((token) => token.text === text && token.scopes.includes(scope)),
      `${text} was not classified as ${scope}`,
    );
  };

  expectScope("include", "keyword.control.directive.include.pawn");
  expectScope("defined", "keyword.control.directive.conditional.pawn");
  expectScope("FEATURE_ENABLED", "entity.name.constant.preprocessor.pawn");
  expectScope("ACTIVE_COLOUR", "entity.name.constant.preprocessor.pawn");
  expectScope("enum", "storage.type.pawn");
  expectScope("hook", "storage.modifier.pawn");
  expectScope("OnGameModeInit", "entity.name.function.definition.pawn");
  expectScope("foreach", "keyword.control.pawn");
  expectScope("SendClientMessage", "entity.name.function.pawn");
  expectScope("0x33CCFFFF", "constant.numeric.pawn");
});
