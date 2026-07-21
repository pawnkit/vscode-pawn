import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, State, Trace } from "vscode-languageclient/node";
import { ToolManager } from "./toolManager";

export class PawnLanguageClient implements vscode.Disposable {
  private client?: LanguageClient;
  private readonly status: vscode.StatusBarItem;
  private readonly toolSubscription: vscode.Disposable;

  constructor(private readonly output: vscode.OutputChannel, private readonly tools: ToolManager) {
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
    this.status.command = "pawn.showOutput";
    this.status.name = "Pawn language server";
    this.toolSubscription = this.tools.onDidInstall((binary) => {
      if (binary === "pawntest") {
        void this.updateIncludePaths().catch((error: unknown) => this.output.appendLine(`Could not update include paths: ${String(error)}`));
      }
    });
  }

  async start(): Promise<void> {
    if (this.client) return;
    const config = vscode.workspace.getConfiguration("pawn.server");
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const command = await this.tools.resolve("pawnlsp", config.get<string>("path"), root);
    const server: ServerOptions = { command, args: [] };
    const options: LanguageClientOptions = {
      documentSelector: [{ scheme: "file", language: "pawn" }],
      outputChannel: this.output,
      initializationOptions: { includePaths: this.tools.includePaths() },
      workspaceFolder: vscode.workspace.workspaceFolders?.[0],
      synchronize: {
        configurationSection: "pawn",
        fileEvents: [
          vscode.workspace.createFileSystemWatcher("**/{pawn.json,pawn.lock,.pawnlint.toml}"),
          vscode.workspace.createFileSystemWatcher("**/*.{pwn,inc}")
        ]
      }
    };
    const client = new LanguageClient("pawn", "Pawn Language Server", server, options);
    const trace = config.get<string>("trace", "off");
    client.setTrace(trace === "verbose" ? Trace.Verbose : trace === "messages" ? Trace.Messages : Trace.Off);
    client.onDidChangeState(({ newState }) => this.updateStatus(newState));
    this.client = client;
    this.updateStatus(State.Starting);
    await client.start();
  }

  async stop(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    if (client) await client.stop();
    this.status.hide();
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  dispose(): void {
    void this.stop();
    this.toolSubscription.dispose();
    this.status.dispose();
  }

  private async updateIncludePaths(): Promise<void> {
    if (!this.client || this.client.state !== State.Running) return;
    await this.client.sendNotification("workspace/didChangeConfiguration", {
      settings: { pawn: { includePaths: this.tools.includePaths() } }
    });
  }

  private updateStatus(state: State): void {
    const labels = { [State.Starting]: "$(sync~spin) Pawn", [State.Running]: "$(check) Pawn", [State.Stopped]: "$(error) Pawn" };
    this.status.text = labels[state];
    this.status.tooltip = state === State.Running ? "Pawn language server is running" : "Open Pawn language server output";
    this.status.show();
  }
}
