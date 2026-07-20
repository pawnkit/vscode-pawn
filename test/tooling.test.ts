import assert from "node:assert/strict";
import test from "node:test";
import { expectedChecksum, releaseAsset, sha256 } from "../src/tooling";

test("selects the release archive for the current target", () => {
  const assets = [
    { name: "pawntest_Darwin_arm64.tar.gz", browser_download_url: "arm" },
    { name: "pawntest_Windows_x86_64.zip", browser_download_url: "windows" }
  ];
  assert.equal(releaseAsset(assets, "win32", "x64")?.browser_download_url, "windows");
  assert.equal(releaseAsset(assets, "darwin", "arm64")?.browser_download_url, "arm");
});

test("matches GoReleaser checksums", () => {
  const digest = sha256(Buffer.from("pawn"));
  assert.equal(expectedChecksum(`${digest}  pawn-linux-amd64.tar.gz\n`, "pawn-linux-amd64.tar.gz"), digest);
  assert.equal(expectedChecksum(`${digest}  another-file.zip\n`, "pawn-linux-amd64.tar.gz"), undefined);
});
