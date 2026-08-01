import assert from "node:assert/strict";
import test from "node:test";
import { findPawnColors } from "../src/colors";

test("finds Pawn hex colors and embedded string colors", () => {
  const matches = findPawnColors('#define RED 0xAABBCC\nSendClientMessage(playerid, "{11223344}");');

  assert.deepEqual(matches.map(({ text, red, green, blue, alpha }) => ({ text, red, green, blue, alpha })), [
    { text: "0xAABBCC", red: 170, green: 187, blue: 204, alpha: 255 },
    { text: "{11223344}", red: 17, green: 34, blue: 51, alpha: 68 },
  ]);
});

test("does not treat incomplete values as colors", () => {
  assert.deepEqual(findPawnColors("0x12345 0x1234567 {ABCDEF0}"), []);
});
