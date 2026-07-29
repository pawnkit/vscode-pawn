import * as vscode from "vscode";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { ToolManager } from "./toolManager";
import { run } from "./process";
import { formatTestResult, parseTestReport, testRunArgs } from "./testProtocol";

interface TestDescription { id: string; label: string; file?: string; line?: number; }
interface TestList { schemaVersion: number; tests: TestDescription[]; }
interface TestMetadata { name: string; file?: string; }

export class PawnTests implements vscode.Disposable, vscode.CodeLensProvider {
  private readonly controller = vscode.tests.createTestController("pawnTests", "Pawn Tests");
  private readonly subscriptions: vscode.Disposable[] = [];
  private readonly metadata = new Map<string, TestMetadata>();
  private readonly items = new Map<string, vscode.TestItem>();
  private readonly lensesChanged = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this.lensesChanged.event;

  constructor(private readonly output: vscode.OutputChannel, private readonly tools: ToolManager) {
    this.controller.refreshHandler = () => this.discover(true);
    const profile = this.controller.createRunProfile("Run", vscode.TestRunProfileKind.Run, (request, token) => this.execute(request, token));
    profile.isDefault = true;
    this.subscriptions.push(
      vscode.languages.registerCodeLensProvider({ language: "pawn", scheme: "file" }, this),
      vscode.commands.registerCommand("pawn.runTest", (id: unknown) => this.runItem(id)),
      vscode.commands.registerCommand("pawn.runTestFile", (id: unknown) => this.runItem(id)),
      this.lensesChanged
    );
    this.subscriptions.push(this.tools.onDidInstall((binary) => {
      if (binary === "pawntest") void this.discover(false);
    }));
    void this.discover(false);
  }

  dispose(): void {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.controller.dispose();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const result: vscode.CodeLens[] = [];
    this.controller.items.forEach((file) => {
      if (!file.uri || file.uri.toString() !== document.uri.toString()) return;
      let first: vscode.Range | undefined;
      file.children.forEach((item) => {
        if (!item.range) return;
        first ??= item.range;
        result.push(new vscode.CodeLens(item.range, {
          title: "Run Test", command: "pawn.runTest", arguments: [item.id]
        }));
      });
      if (first && file.children.size > 1) {
        result.unshift(new vscode.CodeLens(first, {
          title: "Run All Tests in File", command: "pawn.runTestFile", arguments: [file.id]
        }));
      }
    });
    return result;
  }

  private async tool(prompt = true): Promise<{ executable: string; cwd: string }> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) throw new Error("Open a workspace to use Pawn tests.");
    const configured = vscode.workspace.getConfiguration("pawn.test", folder.uri).get<string>("path");
    const executable = prompt
      ? await this.tools.resolve("pawntest", configured, folder.uri.fsPath)
      : await this.tools.find("pawntest", configured, folder.uri.fsPath);
    if (!executable) throw new ToolUnavailableError();
    return { executable, cwd: folder.uri.fsPath };
  }

  private async discover(prompt = true): Promise<void> {
    this.controller.items.replace([]);
    this.metadata.clear();
    this.items.clear();
    if (!vscode.workspace.isTrusted || !vscode.workspace.workspaceFolders?.length) return;
    try {
      const { executable, cwd } = await this.tool(prompt);
      const args = vscode.workspace.getConfiguration("pawn.test").get<string[]>("discoveryArgs", ["--list", "--format", "json"]);
      const result = await run(executable, args, cwd);
      if (result.code !== 0) throw new Error(result.stderr.trim() || `pawntest exited with ${result.code}`);
      const document = JSON.parse(result.stdout) as TestList;
      if (document.schemaVersion !== 1 || !Array.isArray(document.tests)) throw new Error("unsupported pawntest discovery response");
      const ids = new Set<string>();
      const files = new Map<string, vscode.TestItem>();
      for (const test of document.tests) {
        const key = `${test.file ?? ""}\0${test.id}`;
        if (typeof test.id !== "string" || test.id === "" || typeof test.label !== "string" || test.label === "" || ids.has(key) || (test.file !== undefined && typeof test.file !== "string")) {
          throw new Error("invalid pawntest discovery response");
        }
        ids.add(key);
        const uri = test.file ? testURI(cwd, test.file) : undefined;
        const itemID = `test:${test.file ?? ""}:${test.id}`;
        const item = this.controller.createTestItem(itemID, test.label, uri);
        this.metadata.set(itemID, { name: test.id, file: test.file });
        this.items.set(itemID, item);
        if (Number.isInteger(test.line) && test.line! > 0) item.range = new vscode.Range(test.line! - 1, 0, test.line! - 1, 0);
        if (!test.file || !uri) {
          this.controller.items.add(item);
          continue;
        }
        let file = files.get(test.file);
        if (!file) {
          file = this.controller.createTestItem(`file:${test.file}`, test.file, uri);
          files.set(test.file, file);
          this.items.set(file.id, file);
          this.controller.items.add(file);
        }
        file.children.add(item);
      }
      this.lensesChanged.fire();
    } catch (error) {
      if (error instanceof ToolUnavailableError) return;
      this.output.appendLine(`Test discovery: ${String(error)}`);
    }
  }

  private async runItem(id: unknown): Promise<void> {
    if (typeof id !== "string") return;
    const item = this.items.get(id);
    if (!item) return;
    const source = new vscode.CancellationTokenSource();
    try {
      await this.execute(new vscode.TestRunRequest([item]), source.token);
    } finally {
      source.dispose();
    }
  }

  private async execute(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
    const execution = this.controller.createTestRun(request);
    const selected: vscode.TestItem[] = [];
    const excluded = new Set<string>();
    request.exclude?.forEach((item) => collectIDs(item, excluded));
    const collect = (item: vscode.TestItem) => collectLeafTests(item, selected, excluded);
    if (request.include) request.include.forEach(collect);
    else this.controller.items.forEach(collect);
    selected.forEach((item) => execution.started(item));
    try {
      const { executable, cwd } = await this.tool();
      if (selected.length === 0) return;
      const targets = selected.map((item) => this.metadata.get(item.id)).filter((item): item is TestMetadata => item !== undefined);
      const args = testRunArgs(targets);
      if (token.isCancellationRequested) {
        selected.forEach((item) => execution.skipped(item));
        return;
      }
      const controller = new AbortController();
      const subscription = token.onCancellationRequested(() => controller.abort());
      const result = await run(executable, args, cwd, 1024 * 1024, controller.signal).finally(() => subscription.dispose());
      const report = parseTestReport(result.stdout);
      const results = new Map(report.results.map((item) => [resultKey(item.name, item.source), item]));
      for (const item of selected) {
        const target = this.metadata.get(item.id);
        const test = target ? results.get(resultKey(target.name, target.file)) : undefined;
        if (!test) {
          execution.errored(item, new vscode.TestMessage(`pawntest did not report ${item.label}`));
          continue;
        }
        execution.appendOutput(formatTestResult(test, item.label), undefined, item);
        const message = new vscode.TestMessage(test.message || test.warnings?.join("\n") || `pawntest reported ${test.status}`);
        switch (test.status) {
          case "pass": execution.passed(item, test.duration_ms); break;
          case "xfail": execution.passed(item, test.duration_ms); break;
          case "skip": execution.skipped(item); break;
          case "error": execution.errored(item, message, test.duration_ms); break;
          default: execution.failed(item, message, test.duration_ms);
        }
      }
      if (result.stderr.trim()) execution.appendOutput(`${result.stderr.trim()}\r\n`);
    } catch (error) {
      selected.forEach((item) => token.isCancellationRequested ? execution.skipped(item) : execution.errored(item, new vscode.TestMessage(String(error))));
    } finally {
      execution.end();
    }
  }
}

function collectLeafTests(item: vscode.TestItem, result: vscode.TestItem[], excluded: Set<string>): void {
  if (excluded.has(item.id)) return;
  if (item.children.size === 0) {
    result.push(item);
    return;
  }
  item.children.forEach((child) => collectLeafTests(child, result, excluded));
}

function collectIDs(item: vscode.TestItem, result: Set<string>): void {
  result.add(item.id);
  item.children.forEach((child) => collectIDs(child, result));
}

function resultKey(name: string, file?: string): string {
  return `${file?.replace(/\\/g, "/") ?? ""}\0${name}`;
}

class ToolUnavailableError extends Error {}

function testURI(cwd: string, file: string): vscode.Uri | undefined {
  const candidate = resolve(cwd, file);
  const path = relative(cwd, candidate);
  if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`)) return undefined;
  return vscode.Uri.file(candidate);
}
