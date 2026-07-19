import * as vscode from "vscode";
import { resolveBinary } from "./binary";

export class PawnDebugProvider implements vscode.DebugConfigurationProvider {
  async resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration): Promise<vscode.DebugConfiguration | undefined> {
    if (!vscode.workspace.isTrusted) {
      void vscode.window.showWarningMessage("Trust this workspace before debugging Pawn.");
      return undefined;
    }
    if (!config.type) Object.assign(config, { type: "pawn", request: "launch", name: "Debug Pawn", program: "${workspaceFolder}/gamemodes/main.amx" });
    return config;
  }
}

export class PawnDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
  async createDebugAdapterDescriptor(session: vscode.DebugSession): Promise<vscode.DebugAdapterDescriptor> {
    if (!vscode.workspace.isTrusted) throw new Error("Trust this workspace before debugging Pawn.");
    const folder = session.workspaceFolder;
    const configured = vscode.workspace.getConfiguration("pawn.debug", folder?.uri).get<string>("path");
    const command = await resolveBinary({ configured, name: "pawndebug", workspace: folder?.uri.fsPath });
    return new vscode.DebugAdapterExecutable(command, []);
  }
}
