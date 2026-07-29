import * as vscode from "vscode";
import { findTopLevelMain, SymbolNode } from "./entryPoint";

export class EntryCodeLensProvider implements vscode.CodeLensProvider {
  async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    const symbols = await vscode.commands.executeCommand<(vscode.DocumentSymbol | vscode.SymbolInformation)[]>(
      "vscode.executeDocumentSymbolProvider",
      document.uri
    );
    if (!symbols) return [];

    const range = findTopLevelMain(
      symbols.map((symbol) => ({
        name: symbol.name,
        kind: symbol.kind,
        range: "location" in symbol ? symbol.location.range : symbol.range
      } satisfies SymbolNode<vscode.Range>)),
      vscode.SymbolKind.Function
    );
    if (!range) return [];

    return [
      new vscode.CodeLens(range, { title: "Build Project", command: "pawn.build" }),
      new vscode.CodeLens(range, { title: "Run Project", command: "pawn.run" })
    ];
  }
}
