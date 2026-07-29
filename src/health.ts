import * as vscode from "vscode";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { run } from "./process";
import { ToolManager } from "./toolManager";
import { DoctorFinding, readDoctorReport } from "./healthProtocol";
import { ProjectReport, readProjectReport } from "./projectProtocol";

export class ProjectHealth implements vscode.Disposable {
  private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 49);
  private readonly subscriptions: vscode.Disposable[] = [];
  private timer?: NodeJS.Timeout;
  private findings: DoctorFinding[] = [];
  private project?: ProjectReport;
  private folder?: vscode.WorkspaceFolder;
  private generation = 0;

  constructor(private readonly tools: ToolManager) {
    this.status.name = "Pawn project health";
    this.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(() => this.schedule()),
      vscode.workspace.onDidCreateFiles(() => this.schedule()),
      vscode.workspace.onDidDeleteFiles(() => this.schedule()),
      vscode.window.onDidChangeActiveTextEditor(() => this.schedule(0)),
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
    const folder = this.folder;
    const project = this.project;
    const profile = project?.profile || "No profile";
    const context = [project?.build && `build: ${project.build}`, project?.runtime && `runtime: ${project.runtime}`].filter(Boolean).join(", ");
    const choices = [
      ...(this.findings.length > 0 ? [{
        label: `$(warning) Show ${this.findings.length} project issue${this.findings.length === 1 ? "" : "s"}`,
        detail: "Review findings and suggested actions", action: "issues"
      }] : []),
      { label: `$(target) Profile: ${profile}`, detail: context || "Resolved from the project manifest", action: "manifest" },
      { label: "$(json) Open project configuration", detail: project?.manifest, action: "manifest" },
      { label: "$(check-all) Check project", detail: "Run format and lint checks", action: "check" },
      { label: "$(tools) Diagnose project", detail: "Run Pawn doctor", action: "doctor" },
      { label: "$(versions) Show tool versions", action: "versions" }
    ];
    const selected = await vscode.window.showQuickPick(choices, {
      title: vscode.workspace.workspaceFolders?.length === 1 ? "Pawn project" : `Pawn project: ${folder?.name ?? "workspace"}`,
      placeHolder: "Choose a project action"
    });
    if (!selected) return;
    if (selected.action === "issues") {
      await this.showFindings(folder);
    } else if (selected.action === "manifest") {
      await this.openManifest(folder);
    } else {
      await vscode.commands.executeCommand(`pawn.${selected.action}`);
    }
  }

  private schedule(delay = 500): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.inspect(), delay);
  }

  private async inspect(): Promise<void> {
    const generation = ++this.generation;
    const active = vscode.window.activeTextEditor?.document.uri;
    const folder = active ? vscode.workspace.getWorkspaceFolder(active) ?? vscode.workspace.workspaceFolders?.[0] : vscode.workspace.workspaceFolders?.[0];
    if (!folder || !vscode.workspace.isTrusted) {
      this.folder = undefined;
      this.project = undefined;
      this.status.hide();
      return;
    }
    this.folder = folder;
    if (!await hasManifest(folder)) {
      this.findings = [];
      this.project = undefined;
      this.show("$(tools) Pawn: Set up", "Set up this workspace as a PawnKit project", "pawn.setupProject");
      return;
    }
    const configured = vscode.workspace.getConfiguration("pawn.cli", folder.uri).get<string>("path");
    const executable = await this.tools.find("pawn", configured, folder.uri.fsPath);
    if (!executable) {
      this.findings = [];
      this.project = undefined;
      this.show("$(warning) Pawn: Tools needed", "Install PawnKit tools to check this project", "pawn.installTools");
      return;
    }
    try {
      const [doctorResult, projectResult] = await Promise.all([
        run(executable, ["doctor", "--project", folder.uri.fsPath, "--output", "json"], folder.uri.fsPath),
        run(executable, ["project", "--project", folder.uri.fsPath, "--output", "json"], folder.uri.fsPath)
      ]);
      const report = readDoctorReport(doctorResult.stdout);
      const project = readProjectReport(projectResult.stdout);
      if (generation !== this.generation) return;
      this.findings = report.findings;
      this.project = project;
      const count = report.findings.length;
      const profile = project.profile || "unconfigured";
      if (count > 0) {
        this.show(`$(warning) Pawn: ${profile} (${count})`, "Show Pawn project status", "pawn.showProjectHealth");
      } else {
        this.show(`$(pass) Pawn: ${profile}`, projectTooltip(project), "pawn.showProjectHealth");
      }
    } catch {
      if (generation !== this.generation) return;
      this.findings = [];
      this.project = undefined;
      this.show("$(error) Pawn: Check failed", "Run Pawn: Diagnose Project for details", "pawn.doctor");
    }
  }

  private async showFindings(folder: vscode.WorkspaceFolder | undefined): Promise<void> {
    const selected = await vscode.window.showQuickPick(this.findings.map((finding) => ({
      label: `${finding.severity === "error" ? "$(error)" : "$(warning)"} ${finding.message}`,
      description: finding.path,
      detail: finding.remediation?.message ?? `${finding.source}: ${finding.id}`,
      finding
    })), {
      title: "Pawn project issues", placeHolder: "Choose an issue for actions",
      matchOnDescription: true, matchOnDetail: true
    });
    if (selected) await this.showActions(selected.finding, folder);
  }

  private async openManifest(folder: vscode.WorkspaceFolder | undefined): Promise<void> {
    let manifest: vscode.Uri | undefined;
    if (folder && this.project?.manifest) {
      const path = relative(folder.uri.fsPath, this.project.manifest);
      if (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path)) {
        manifest = vscode.Uri.file(this.project.manifest);
      }
    }
    manifest ??= folder ? await findManifest(folder) : undefined;
    if (manifest) await vscode.window.showTextDocument(manifest);
  }

  private async showActions(finding: DoctorFinding, folder: vscode.WorkspaceFolder | undefined): Promise<void> {
    const actions: { label: string; action: "open" | "config" | "copy" | "doctor" }[] = [];
    if (finding.path) actions.push({ label: "$(go-to-file) Open file", action: "open" });
    if (folder && await findManifest(folder)) actions.push({ label: "$(json) Open project configuration", action: "config" });
    if (finding.remediation?.command) actions.push({ label: "$(copy) Copy suggested command", action: "copy" });
    actions.push({ label: "$(terminal) Run Pawn doctor", action: "doctor" });
    const selected = await vscode.window.showQuickPick(actions, { title: finding.message, placeHolder: finding.remediation?.message });
    if (!selected) return;
    if (selected.action === "doctor") {
      await vscode.commands.executeCommand("pawn.doctor");
      return;
    }
    if (selected.action === "config" && folder) {
      const manifest = await findManifest(folder);
      if (manifest) await vscode.window.showTextDocument(manifest);
      return;
    }
    if (selected.action === "copy" && finding.remediation?.command) {
      await vscode.env.clipboard.writeText(finding.remediation.command);
      void vscode.window.showInformationMessage("Suggested command copied.");
      return;
    }
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

function projectTooltip(project: ProjectReport): string {
  const details = [`Profile: ${project.profile || "none"}`];
  if (project.build) details.push(`Build: ${project.build}`);
  if (project.runtime) details.push(`Runtime: ${project.runtime}`);
  return details.join("\n");
}

async function hasManifest(folder: vscode.WorkspaceFolder): Promise<boolean> {
  return await findManifest(folder) !== undefined;
}

async function findManifest(folder: vscode.WorkspaceFolder): Promise<vscode.Uri | undefined> {
  for (const name of ["pawn.json", "pawn.yaml", "pawn.yml"]) {
    try {
      const uri = vscode.Uri.joinPath(folder.uri, name);
      await vscode.workspace.fs.stat(uri);
      return uri;
    } catch {
      // Try the next supported filename.
    }
  }
  return undefined;
}
