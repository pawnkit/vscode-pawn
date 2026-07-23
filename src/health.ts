import * as vscode from "vscode";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { run } from "./process";
import { ToolManager } from "./toolManager";
import { DoctorFinding, readDoctorReport } from "./healthProtocol";

export class ProjectHealth implements vscode.Disposable {
  private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 49);
  private readonly subscriptions: vscode.Disposable[] = [];
  private timer?: NodeJS.Timeout;
  private findings: DoctorFinding[] = [];
  private generation = 0;

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

  async showDetails(): Promise<void> {
    if (this.findings.length === 0) {
      void vscode.window.showInformationMessage("PawnKit found no project issues.");
      return;
    }
    const selected = await vscode.window.showQuickPick(this.findings.map((finding) => ({
      label: `${finding.severity === "error" ? "$(error)" : "$(warning)"} ${finding.message}`,
      description: finding.path,
      detail: finding.remediation?.message ?? `${finding.source}: ${finding.id}`,
      finding
    })), { title: "Pawn project health", placeHolder: "Choose an issue for actions", matchOnDescription: true, matchOnDetail: true });
    if (!selected) return;
    await this.showActions(selected.finding);
  }

  private schedule(delay = 500): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.inspect(), delay);
  }

  private async inspect(): Promise<void> {
    const generation = ++this.generation;
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder || !vscode.workspace.isTrusted) {
      this.status.hide();
      return;
    }
    if (!await hasManifest(folder)) {
      this.findings = [];
      this.show("$(tools) Pawn: Set up", "Set up this workspace as a PawnKit project", "pawn.setupProject");
      return;
    }
    const configured = vscode.workspace.getConfiguration("pawn.cli", folder.uri).get<string>("path");
    const executable = await this.tools.find("pawn", configured, folder.uri.fsPath);
    if (!executable) {
      this.findings = [];
      this.show("$(warning) Pawn: Tools needed", "Install PawnKit tools to check this project", "pawn.installTools");
      return;
    }
    try {
      const result = await run(executable, ["doctor", "--project", folder.uri.fsPath, "--output", "json"], folder.uri.fsPath);
      const report = readDoctorReport(result.stdout);
      if (generation !== this.generation) return;
      this.findings = report.findings;
      const count = report.findings.length;
      if (count > 0) {
        this.show(`$(warning) Pawn: ${count} issue${count === 1 ? "" : "s"}`, "Show PawnKit project issues", "pawn.showProjectHealth");
      } else {
        this.show("$(pass) Pawn: Ready", "PawnKit project checks passed", "pawn.doctor");
      }
    } catch {
      if (generation !== this.generation) return;
      this.findings = [];
      this.show("$(error) Pawn: Check failed", "Run Pawn: Diagnose Project for details", "pawn.doctor");
    }
  }

  private async showActions(finding: DoctorFinding): Promise<void> {
    const actions: { label: string; action: "open" | "copy" | "doctor" }[] = [];
    if (finding.path) actions.push({ label: "$(go-to-file) Open file", action: "open" });
    if (finding.remediation?.command) actions.push({ label: "$(copy) Copy suggested command", action: "copy" });
    actions.push({ label: "$(terminal) Run Pawn doctor", action: "doctor" });
    const selected = await vscode.window.showQuickPick(actions, { title: finding.message, placeHolder: finding.remediation?.message });
    if (!selected) return;
    if (selected.action === "doctor") {
      await vscode.commands.executeCommand("pawn.doctor");
      return;
    }
    if (selected.action === "copy" && finding.remediation?.command) {
      await vscode.env.clipboard.writeText(finding.remediation.command);
      void vscode.window.showInformationMessage("Suggested command copied.");
      return;
    }
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (selected.action === "open" && folder && finding.path) {
      const target = resolve(folder.uri.fsPath, finding.path);
      const path = relative(folder.uri.fsPath, target);
      if (path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) {
        void vscode.window.showErrorMessage("The reported file is outside this workspace.");
        return;
      }
      const uri = vscode.Uri.file(target);
      try {
        await vscode.window.showTextDocument(uri);
      } catch {
        void vscode.window.showErrorMessage(`Could not open ${finding.path}.`);
      }
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
