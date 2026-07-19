import assert from "node:assert/strict";
import AdmZip from "adm-zip";

const archive = process.argv[2];
assert.ok(archive, "usage: npm run verify-package -- <file.vsix>");
const zip = new AdmZip(archive);
const files = zip.getEntries().map((entry) => entry.entryName);
assert.ok(files.includes("extension/dist/extension.js"));
assert.ok(files.includes("extension/changelog.md"));
assert.ok(!files.some((file) => file.includes("node_modules")));
const bundle = zip.readAsText("extension/dist/extension.js");
assert.ok(bundle.includes("LanguageClient"));
assert.ok(!bundle.includes('require("vscode-languageclient/node")'));
