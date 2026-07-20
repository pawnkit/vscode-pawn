import * as vscode from "vscode";
import { ToolManager } from "./toolManager";

const commands: Record<string, string[]> = {
  check: ["check"],
  fmt: ["check", "--only", "format"], lint: ["check", "--only", "lint"],
  doctor: ["doctor"]
};

export function registerToolCommands(context: vscode.ExtensionContext, tools: ToolManager): void {
  for (const [name, args] of Object.entries(commands)) {
    context.subscriptions.push(vscode.commands.registerCommand(`pawn.${name}`, async () => {
      if (!vscode.workspace.isTrusted) {
        void vscode.window.showWarningMessage("Trust this workspace before running PawnKit tools.");
        return;
      }
      const active = vscode.window.activeTextEditor?.document.uri;
      const folder = active ? vscode.workspace.getWorkspaceFolder(active) ?? vscode.workspace.workspaceFolders?.[0] : vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        void vscode.window.showErrorMessage("Open a workspace before running PawnKit tools.");
        return;
      }
      try {
        const config = vscode.workspace.getConfiguration("pawn.cli", folder.uri);
        const executable = await tools.resolve("pawn", config.get<string>("path"), folder.uri.fsPath);
        const terminal = vscode.window.createTerminal({ name: `Pawn: ${name}`, cwd: folder.uri, shellPath: executable, shellArgs: args });
        terminal.show();
      } catch (error) {
        void vscode.window.showErrorMessage(String(error));
      }
    }));
  }
}

export class PawnTaskProvider implements vscode.TaskProvider {
  constructor(private readonly tools: ToolManager) {}

  async provideTasks(): Promise<vscode.Task[]> {
    if (!vscode.workspace.isTrusted) return [];
    const tasks: vscode.Task[] = [];
    for (const folder of vscode.workspace.workspaceFolders ?? []) {
      for (const [name, args] of Object.entries(commands)) tasks.push(await this.task(folder, name, args));
    }
    return tasks;
  }

  async resolveTask(task: vscode.Task): Promise<vscode.Task | undefined> {
    if (!vscode.workspace.isTrusted) return undefined;
    const name = task.definition.task;
    const args = typeof name === "string" ? commands[name] : undefined;
    const folder = typeof task.scope === "object" ? task.scope : vscode.workspace.workspaceFolders?.[0];
    if (!folder || !args) return undefined;
    return this.task(folder, name, args);
  }

  private async task(folder: vscode.WorkspaceFolder, name: string, args: string[]): Promise<vscode.Task> {
    const configured = vscode.workspace.getConfiguration("pawn.cli", folder.uri).get<string>("path");
    const executable = await this.tools.resolve("pawn", configured, folder.uri.fsPath);
    const execution = new vscode.ProcessExecution(executable, args, { cwd: folder.uri.fsPath });
    return new vscode.Task({ type: "pawn", task: name }, folder, name, "pawn", execution, []);
  }
}
