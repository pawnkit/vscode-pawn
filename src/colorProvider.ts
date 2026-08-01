import * as vscode from "vscode";
import { findPawnColors, PawnColorMatch } from "./colors";

export class PawnColorProvider implements vscode.DocumentColorProvider {
  provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
    const colors: vscode.ColorInformation[] = [];
    for (let line = 0; line < document.lineCount; line += 1) {
      const text = document.lineAt(line).text;
      for (const match of findPawnColors(text)) {
        colors.push(new vscode.ColorInformation(
          new vscode.Range(line, match.start, line, match.end),
          toColor(match),
        ));
      }
    }
    return colors;
  }

  provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range }): vscode.ColorPresentation[] {
    const original = context.document.getText(context.range);
    if (!isPawnColor(original)) return [];
    const digits = [color.red, color.green, color.blue]
      .map((value) => byte(value * 255))
      .join("");
    const alpha = byte(color.alpha * 255);
    const hasAlpha = original.length === 10;
    const encoded = hasAlpha ? `${digits}${alpha}` : digits;
    const value = original.startsWith("{") ? `{${encoded}}` : `0x${encoded}`;
    const presentation = new vscode.ColorPresentation(value);
    presentation.textEdit = new vscode.TextEdit(context.range, value);
    return [presentation];
  }
}

function toColor(match: PawnColorMatch): vscode.Color {
  return new vscode.Color(match.red / 255, match.green / 255, match.blue / 255, match.alpha / 255);
}

function isPawnColor(value: string): boolean {
  return /^0x(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value) || /^\{(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\}$/.test(value);
}

function byte(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0").toUpperCase();
}
