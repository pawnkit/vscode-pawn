import * as vscode from "vscode";
import { buildArgs } from "./buildArgs";
import { ToolManager } from "./toolManager";

const commands: Record<string, readonly string[]> = {
  check: ["check"],
  fmt: ["check", "--only", "format"],
  lint: ["check", "--only", "lint"],
  doctor: ["doctor"]
};

export function registerToolCommands(context: vscode.ExtensionContext, tools: ToolManager): void {
  for (const name of [...Object.keys(commands), "build"]) {
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
        const args = commandArgs(folder, name);
        if (!args) {
          const choice = await vscode.window.showErrorMessage(
            "Set exactly one of pawn.build.compiler or pawn.build.backend before building.",
            "Open Settings"
          );
          if (choice === "Open Settings") {
            await vscode.commands.executeCommand("workbench.action.openSettings", "pawn.build");
          }
          return;
        }
        const config = vscode.workspace.getConfiguration("pawn.cli", folder.uri);
        const executable = await tools.resolve("pawn", config.get<string>("path"), folder.uri.fsPath);
        const terminal = vscode.window.createTerminal({ name: `Pawn: ${name}`, cwd: folder.uri, shellPath: executable, shellArgs: [...args] });
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
      for (const name of [...Object.keys(commands), "build"]) {
        const args = commandArgs(folder, name);
        if (args) tasks.push(await this.task(folder, name, args));
      }
    }
    return tasks;
  }

  async resolveTask(task: vscode.Task): Promise<vscode.Task | undefined> {
    if (!vscode.workspace.isTrusted) return undefined;
    const name = task.definition.task;
    const folder = typeof task.scope === "object" ? task.scope : vscode.workspace.workspaceFolders?.[0];
    if (!folder || typeof name !== "string") return undefined;
    const args = commandArgs(folder, name, task.definition);
    if (!args) return undefined;
    return this.task(folder, name, args);
  }

  private async task(folder: vscode.WorkspaceFolder, name: string, args: readonly string[]): Promise<vscode.Task> {
    const configured = vscode.workspace.getConfiguration("pawn.cli", folder.uri).get<string>("path");
    const executable = await this.tools.resolve("pawn", configured, folder.uri.fsPath);
    const execution = new vscode.ProcessExecution(executable, [...args], { cwd: folder.uri.fsPath });
    return new vscode.Task({ type: "pawn", task: name }, folder, name, "pawn", execution, []);
  }
}

function commandArgs(folder: vscode.WorkspaceFolder, name: string, definition?: vscode.TaskDefinition): readonly string[] | undefined {
  if (name !== "build") return commands[name];

  const config = vscode.workspace.getConfiguration("pawn.build", folder.uri);
  return buildArgs({
    project: taskString(definition, "project"),
    profile: taskString(definition, "profile"),
    build: taskString(definition, "build"),
    runtime: taskString(definition, "runtime"),
    compiler: taskString(definition, "compiler") ?? config.get<string>("compiler"),
    backend: taskString(definition, "backend") ?? config.get<string>("backend"),
    artifact: taskString(definition, "artifact") ?? config.get<string>("artifact")
  });
}

function taskString(definition: vscode.TaskDefinition | undefined, key: string): string | undefined {
  const value = definition?.[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}
