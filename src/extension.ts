import * as vscode from "vscode";
import { PawnLanguageClient } from "./client";
import { PawnTaskProvider, registerToolCommands } from "./commands";
import { PawnDebugAdapterFactory, PawnDebugProvider } from "./debug";
import { PawnTests } from "./testing";
import { ToolManager } from "./toolManager";
import { ProjectHealth } from "./health";
import { setupProject } from "./setup";

let languageClient: PawnLanguageClient | undefined;
let pawnTests: PawnTests | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel("PawnKit", { log: true });
  const tools = new ToolManager(context, output);
  const health = new ProjectHealth(tools);
  languageClient = new PawnLanguageClient(output, tools);
  context.subscriptions.push(output, tools, health, languageClient);
  context.subscriptions.push(vscode.commands.registerCommand("pawn.setupProject", async () => {
    try {
      if (await setupProject(tools)) {
        health.refresh();
        await languageClient!.restart();
      }
    } catch (error) {
      void vscode.window.showErrorMessage(`PawnKit setup: ${String(error)}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("pawn.restartServer", async () => {
    if (!vscode.workspace.isTrusted) {
      void vscode.window.showWarningMessage("Trust this workspace before starting PawnKit tools.");
      return;
    }
    await start(languageClient!);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("pawn.showOutput", () => output.show()));
  context.subscriptions.push(vscode.commands.registerCommand("pawn.openRuleDocumentation", async (ruleID: unknown) => {
    if (typeof ruleID !== "string" || !/^[a-z0-9-]+$/.test(ruleID)) return;
    await vscode.env.openExternal(vscode.Uri.parse(`https://github.com/pawnkit/pawnlint/blob/main/docs/rules/${ruleID}.md`));
  }));
  context.subscriptions.push(vscode.tasks.registerTaskProvider("pawn", new PawnTaskProvider(tools)));
  context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider("pawn", new PawnDebugProvider()));
  context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory("pawn", new PawnDebugAdapterFactory(tools)));
  context.subscriptions.push(vscode.commands.registerCommand("pawn.installTools", () => tools.chooseAndInstall()));
  context.subscriptions.push(vscode.commands.registerCommand("pawn.showToolVersions", () => tools.showVersions()));
  registerToolCommands(context, tools);
  const startTrustedFeatures = async (): Promise<void> => {
    if (!pawnTests) {
      pawnTests = new PawnTests(output, tools);
      context.subscriptions.push(pawnTests);
    }
    await start(languageClient!);
  };
  if (vscode.workspace.isTrusted) {
    await startTrustedFeatures();
  } else {
    output.appendLine("PawnKit tools are disabled until the workspace is trusted.");
    context.subscriptions.push(vscode.workspace.onDidGrantWorkspaceTrust(() => void startTrustedFeatures()));
  }
}

export async function deactivate(): Promise<void> {
  await languageClient?.stop();
}

async function start(client: PawnLanguageClient): Promise<void> {
  try {
    await client.restart();
  } catch (error) {
    const choice = await vscode.window.showErrorMessage(`Pawn language server: ${String(error)}`, "Open Settings", "Show Output");
    if (choice === "Open Settings") await vscode.commands.executeCommand("workbench.action.openSettings", "pawn.server.path");
    if (choice === "Show Output") await vscode.commands.executeCommand("pawn.showOutput");
  }
}
