import * as vscode from "vscode";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { ToolManager } from "./toolManager";
import { run } from "./process";

interface TestDescription { id: string; label: string; file?: string; line?: number; }
interface TestList { schemaVersion: number; tests: TestDescription[]; }

export class PawnTests implements vscode.Disposable {
  private readonly controller = vscode.tests.createTestController("pawnTests", "Pawn Tests");

  constructor(private readonly output: vscode.OutputChannel, private readonly tools: ToolManager) {
    this.controller.refreshHandler = () => this.discover(true);
    const profile = this.controller.createRunProfile("Run", vscode.TestRunProfileKind.Run, (request, token) => this.execute(request, token));
    profile.isDefault = true;
    void this.discover(false);
  }

  dispose(): void { this.controller.dispose(); }

  private async tool(prompt = true): Promise<{ executable: string; cwd: string }> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) throw new Error("Open a workspace to use Pawn tests.");
    const configured = vscode.workspace.getConfiguration("pawn.test", folder.uri).get<string>("path");
    return { executable: await this.tools.resolve("pawntest", configured, folder.uri.fsPath, prompt), cwd: folder.uri.fsPath };
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
      const args = ["test", "--output", "json", ...selected.flatMap((item) => ["--test", item.id])];
      if (token.isCancellationRequested) {
        selected.forEach((item) => execution.skipped(item));
        return;
      }
      const controller = new AbortController();
      const subscription = token.onCancellationRequested(() => controller.abort());
      const result = await run(executable, args, cwd, 1024 * 1024, controller.signal).finally(() => subscription.dispose());
      execution.appendOutput(result.stdout + result.stderr);
      selected.forEach((item) => result.code === 0 ? execution.passed(item) : execution.failed(item, new vscode.TestMessage(`pawntest exited with ${result.code}`)));
    } catch (error) {
      selected.forEach((item) => token.isCancellationRequested ? execution.skipped(item) : execution.errored(item, new vscode.TestMessage(String(error))));
    } finally {
      execution.end();
    }
  }
}

function testURI(cwd: string, file: string): vscode.Uri | undefined {
  const candidate = resolve(cwd, file);
  const path = relative(cwd, candidate);
  if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`)) return undefined;
  return vscode.Uri.file(candidate);
}
