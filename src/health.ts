import * as vscode from "vscode";
import { run } from "./process";
import { ToolManager } from "./toolManager";

interface DoctorReport { findings?: unknown[]; }

export class ProjectHealth implements vscode.Disposable {
  private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 49);
  private readonly subscriptions: vscode.Disposable[] = [];
  private timer?: NodeJS.Timeout;

  constructor(private readonly tools: ToolManager) {
    this.status.name = "Pawn project health";
    this.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(() => this.schedule()),
      vscode.workspace.onDidCreateFiles(() => this.schedule()),
      vscode.workspace.onDidDeleteFiles(() => this.schedule()),
      tools.onDidInstall((binary) => { if (binary === "pawn") this.schedule(); })
    );
    this.schedule(0);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.status.dispose();
  }

  refresh(): void { this.schedule(0); }

  private schedule(delay = 500): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.inspect(), delay);
  }

  private async inspect(): Promise<void> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder || !vscode.workspace.isTrusted) {
      this.status.hide();
      return;
    }
    if (!await hasManifest(folder)) {
      this.show("$(tools) Pawn: Set up", "Set up this workspace as a PawnKit project", "pawn.setupProject");
      return;
    }
    const configured = vscode.workspace.getConfiguration("pawn.cli", folder.uri).get<string>("path");
    const executable = await this.tools.find("pawn", configured, folder.uri.fsPath);
    if (!executable) {
      this.show("$(warning) Pawn: Tools needed", "Install PawnKit tools to check this project", "pawn.installTools");
      return;
    }
    try {
      const result = await run(executable, ["doctor", "--project", folder.uri.fsPath, "--output", "json"], folder.uri.fsPath);
      const report = JSON.parse(result.stdout) as DoctorReport;
      const count = Array.isArray(report.findings) ? report.findings.length : 0;
      if (count > 0) {
        this.show(`$(warning) Pawn: ${count} issue${count === 1 ? "" : "s"}`, "Run Pawn: Diagnose Project for details", "pawn.doctor");
      } else {
        this.show("$(pass) Pawn: Ready", "PawnKit project checks passed", "pawn.doctor");
      }
    } catch {
      this.show("$(error) Pawn: Check failed", "Run Pawn: Diagnose Project for details", "pawn.doctor");
    }
  }

  private show(text: string, tooltip: string, command: string): void {
    this.status.text = text;
    this.status.tooltip = tooltip;
    this.status.command = command;
    this.status.show();
  }
}

async function hasManifest(folder: vscode.WorkspaceFolder): Promise<boolean> {
  for (const name of ["pawn.json", "pawn.yaml", "pawn.yml"]) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(folder.uri, name));
      return true;
    } catch {
      // Try the next supported filename.
    }
  }
  return false;
}
