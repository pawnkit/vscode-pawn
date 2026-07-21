import * as vscode from "vscode";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { ToolManager } from "./toolManager";
import { run } from "./process";
import { parseTestReport, testRunArgs } from "./testProtocol";

interface TestDescription { id: string; label: string; file?: string; line?: number; }
interface TestList { schemaVersion: number; tests: TestDescription[]; }

export class PawnTests implements vscode.Disposable {
  private readonly controller = vscode.tests.createTestController("pawnTests", "Pawn Tests");
  private readonly subscriptions: vscode.Disposable[] = [];

  constructor(private readonly output: vscode.OutputChannel, private readonly tools: ToolManager) {
    this.controller.refreshHandler = () => this.discover(true);
    const profile = this.controller.createRunProfile("Run", vscode.TestRunProfileKind.Run, (request, token) => this.execute(request, token));
    profile.isDefault = true;
    this.subscriptions.push(this.tools.onDidInstall((binary) => {
      if (binary === "pawntest") void this.discover(false);
    }));
    void this.discover(false);
  }

  dispose(): void {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.controller.dispose();
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
    if (!vscode.workspace.isTrusted || !vscode.workspace.workspaceFolders?.length) return;
    try {
      const { executable, cwd } = await this.tool(prompt);
      const args = vscode.workspace.getConfiguration("pawn.test").get<string[]>("discoveryArgs", ["--list", "--format", "json"]);
      const result = await run(executable, args, cwd);
      if (result.code !== 0) throw new Error(result.stderr.trim() || `pawntest exited with ${result.code}`);
      const document = JSON.parse(result.stdout) as TestList;
      if (document.schemaVersion !== 1 || !Array.isArray(document.tests)) throw new Error("unsupported pawntest discovery response");
      const ids = new Set<string>();
      for (const test of document.tests) {
        if (typeof test.id !== "string" || test.id === "" || typeof test.label !== "string" || test.label === "" || ids.has(test.id) || (test.file !== undefined && typeof test.file !== "string")) {
          throw new Error("invalid pawntest discovery response");
        }
        ids.add(test.id);
        const uri = test.file ? testURI(cwd, test.file) : undefined;
        const item = this.controller.createTestItem(test.id, test.label, uri);
        if (Number.isInteger(test.line) && test.line! > 0) item.range = new vscode.Range(test.line! - 1, 0, test.line! - 1, 0);
        this.controller.items.add(item);
      }
    } catch (error) {
      if (error instanceof ToolUnavailableError) return;
      this.output.appendLine(`Test discovery: ${String(error)}`);
    }
  }

  private async execute(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
    const execution = this.controller.createTestRun(request);
    const selected: vscode.TestItem[] = [];
    if (request.include) request.include.forEach((item) => selected.push(item));
    else this.controller.items.forEach((item) => selected.push(item));
    selected.forEach((item) => execution.started(item));
    try {
      const { executable, cwd } = await this.tool();
      if (selected.length === 0) return;
      const args = testRunArgs(selected.map((item) => item.id));
      if (token.isCancellationRequested) {
        selected.forEach((item) => execution.skipped(item));
        return;
      }
      const controller = new AbortController();
      const subscription = token.onCancellationRequested(() => controller.abort());
      const result = await run(executable, args, cwd, 1024 * 1024, controller.signal).finally(() => subscription.dispose());
      execution.appendOutput(result.stdout + result.stderr);
      const report = parseTestReport(result.stdout);
      const results = new Map(report.results.map((item) => [item.name, item]));
      for (const item of selected) {
        const test = results.get(item.id);
        if (!test) {
          execution.errored(item, new vscode.TestMessage(`pawntest did not report ${item.id}`));
          continue;
        }
        const message = new vscode.TestMessage(test.message || test.warnings?.join("\n") || `pawntest reported ${test.status}`);
        switch (test.status) {
          case "pass": execution.passed(item, test.duration_ms); break;
          case "xfail": execution.passed(item, test.duration_ms); break;
          case "skip": execution.skipped(item); break;
          case "error": execution.errored(item, message, test.duration_ms); break;
          default: execution.failed(item, message, test.duration_ms);
        }
      }
    } catch (error) {
      selected.forEach((item) => token.isCancellationRequested ? execution.skipped(item) : execution.errored(item, new vscode.TestMessage(String(error))));
    } finally {
      execution.end();
    }
  }
}

class ToolUnavailableError extends Error {}

function testURI(cwd: string, file: string): vscode.Uri | undefined {
  const candidate = resolve(cwd, file);
  const path = relative(cwd, candidate);
  if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`)) return undefined;
  return vscode.Uri.file(candidate);
}
