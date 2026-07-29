import * as vscode from "vscode";
import { isAbsolute, relative, sep } from "node:path";
import { buildArgs, runArgs } from "./buildArgs";
import { ToolManager } from "./toolManager";
import { run } from "./process";
import { BuildDiagnostic, readBuildReport } from "./buildProtocol";

const commands: Record<string, readonly string[]> = {
  check: ["check"],
  fmt: ["check", "--only", "format"],
  lint: ["check", "--only", "lint"],
  doctor: ["doctor"]
};

export function registerToolCommands(context: vscode.ExtensionContext, tools: ToolManager): void {
  const builds = new BuildRunner();
  context.subscriptions.push(builds);
  for (const name of [...Object.keys(commands), "build", "run"]) {
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
            name === "run"
              ? "Set pawn.build.backend before running the project."
              : "Set exactly one of pawn.build.compiler or pawn.build.backend before building.",
            "Open Settings"
          );
          if (choice === "Open Settings") {
            await vscode.commands.executeCommand("workbench.action.openSettings", "pawn.build");
          }
          return;
        }
        const config = vscode.workspace.getConfiguration("pawn.cli", folder.uri);
        const executable = await tools.resolve("pawn", config.get<string>("path"), folder.uri.fsPath);
        if (name === "build") {
          await builds.run(executable, args, folder);
          return;
        }
        const terminal = vscode.window.createTerminal({ name: `Pawn: ${name}`, cwd: folder.uri, shellPath: executable, shellArgs: [...args] });
        terminal.show();
      } catch (error) {
        void vscode.window.showErrorMessage(String(error));
      }
    }));
  }
}

class BuildRunner implements vscode.Disposable {
  private readonly diagnostics = vscode.languages.createDiagnosticCollection("pawn-build");
  private active?: AbortController;

  dispose(): void {
    this.active?.abort();
    this.diagnostics.dispose();
  }

  async run(executable: string, args: readonly string[], folder: vscode.WorkspaceFolder): Promise<void> {
    this.active?.abort();
    const controller = new AbortController();
    this.active = controller;
    try {
      const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Building Pawn project",
        cancellable: true
      }, async (_progress, token) => {
        const subscription = token.onCancellationRequested(() => controller.abort());
        try {
          return await run(executable, [...args, "--format", "json"], folder.uri.fsPath, 1024 * 1024, controller.signal);
        } finally {
          subscription.dispose();
        }
      });
      if (this.active !== controller) return;
      const report = readBuildReport(result.stdout);
      this.publish(report.diagnostics, folder);
      if (report.status === "passed") {
        await this.showArtifacts(report.artifacts.map(({ path }) => path));
        return;
      }
      if (report.status === "cancelled") return;
      const action = await vscode.window.showErrorMessage(
        `Pawn build failed with ${report.diagnostics.length} diagnostic${report.diagnostics.length === 1 ? "" : "s"}.`,
        "Show Problems"
      );
      if (action === "Show Problems") await vscode.commands.executeCommand("workbench.actions.view.problems");
    } catch (error) {
      if (controller.signal.aborted) return;
      throw error;
    } finally {
      if (this.active === controller) this.active = undefined;
    }
  }

  private publish(findings: BuildDiagnostic[], folder: vscode.WorkspaceFolder): void {
    const grouped = new Map<string, { uri: vscode.Uri; items: vscode.Diagnostic[] }>();
    for (const finding of findings) {
      const uri = vscode.Uri.parse(finding.primary.uri, true);
      if (uri.scheme !== "file" || !contained(folder.uri.fsPath, uri.fsPath)) continue;
      const range = finding.primary.range;
      const diagnostic = new vscode.Diagnostic(
        range
          ? new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character)
          : new vscode.Range(0, 0, 0, 1),
        finding.message,
        diagnosticSeverity(finding.severity)
      );
      diagnostic.code = finding.code;
      diagnostic.source = finding.source;
      const key = uri.toString();
      const group = grouped.get(key) ?? { uri, items: [] };
      group.items.push(diagnostic);
      grouped.set(key, group);
    }
    this.diagnostics.clear();
    for (const { uri, items } of grouped.values()) this.diagnostics.set(uri, items);
  }

  private async showArtifacts(paths: string[]): Promise<void> {
    if (paths.length === 0) {
      void vscode.window.showInformationMessage("Pawn build completed.");
      return;
    }
    const artifact = vscode.Uri.file(paths[0]!);
    const action = await vscode.window.showInformationMessage(
      paths.length === 1 ? `Built ${vscode.workspace.asRelativePath(artifact)}.` : `Pawn build produced ${paths.length} artifacts.`,
      "Reveal Artifact"
    );
    if (action === "Reveal Artifact") await vscode.commands.executeCommand("revealFileInOS", artifact);
  }
}

function diagnosticSeverity(value: BuildDiagnostic["severity"]): vscode.DiagnosticSeverity {
  switch (value) {
    case "warning": return vscode.DiagnosticSeverity.Warning;
    case "info": return vscode.DiagnosticSeverity.Information;
    case "hint": return vscode.DiagnosticSeverity.Hint;
    default: return vscode.DiagnosticSeverity.Error;
  }
}

function contained(root: string, target: string): boolean {
  const path = relative(root, target);
  return path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

export class PawnTaskProvider implements vscode.TaskProvider {
  constructor(private readonly tools: ToolManager) {}

  async provideTasks(): Promise<vscode.Task[]> {
    if (!vscode.workspace.isTrusted) return [];
    const tasks: vscode.Task[] = [];
    for (const folder of vscode.workspace.workspaceFolders ?? []) {
      for (const name of [...Object.keys(commands), "build", "run"]) {
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
  const config = vscode.workspace.getConfiguration("pawn.build", folder.uri);
  const options = {
    project: taskString(definition, "project"),
    profile: taskString(definition, "profile"),
    build: taskString(definition, "build"),
    runtime: taskString(definition, "runtime"),
    compiler: taskString(definition, "compiler") ?? config.get<string>("compiler"),
    backend: taskString(definition, "backend") ?? config.get<string>("backend"),
    artifact: taskString(definition, "artifact") ?? config.get<string>("artifact")
  };
  if (name === "build") return buildArgs(options);
  if (name === "run") return runArgs(options);
  return commands[name];
}

function taskString(definition: vscode.TaskDefinition | undefined, key: string): string | undefined {
  const value = definition?.[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}
