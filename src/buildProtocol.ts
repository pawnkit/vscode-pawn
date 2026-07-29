export interface BuildPosition {
  line: number;
  character: number;
}

export interface BuildDiagnostic {
  schemaVersion: number;
  code: string;
  source: string;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  primary: {
    uri: string;
    range?: {
      start: BuildPosition;
      end: BuildPosition;
    };
  };
}

export interface BuildArtifact {
  path: string;
  mediaType: string;
  size: number;
  sha256?: string;
}

export interface BuildReport {
  kind: "result";
  schemaVersion: number;
  status: "passed" | "failed" | "cancelled";
  diagnostics: BuildDiagnostic[];
  artifacts: BuildArtifact[];
  process?: {
    stdout?: string;
    stderr?: string;
    truncated?: boolean;
  };
}

export function readBuildReport(value: string): BuildReport {
  const report = JSON.parse(value) as Partial<BuildReport>;
  if (report.kind !== "result" || report.schemaVersion !== 2) throw new Error("Unsupported build report.");
  if (!["passed", "failed", "cancelled"].includes(report.status ?? "")) throw new Error("Invalid build status.");
  if (!Array.isArray(report.diagnostics) || !Array.isArray(report.artifacts)) throw new Error("Invalid build report.");
  for (const diagnostic of report.diagnostics) {
    if (diagnostic.schemaVersion !== 2 || typeof diagnostic.code !== "string" ||
      typeof diagnostic.source !== "string" || typeof diagnostic.message !== "string" ||
      !["error", "warning", "info", "hint"].includes(diagnostic.severity) ||
      !diagnostic.primary || typeof diagnostic.primary.uri !== "string") {
      throw new Error("Invalid build diagnostic.");
    }
    const range = diagnostic.primary.range;
    if (range && !validPosition(range.start) || range && !validPosition(range.end)) {
      throw new Error("Invalid build diagnostic range.");
    }
  }
  for (const artifact of report.artifacts) {
    if (typeof artifact.path !== "string" || typeof artifact.mediaType !== "string" ||
      !Number.isSafeInteger(artifact.size) || artifact.size < 0) {
      throw new Error("Invalid build artifact.");
    }
  }
  return report as BuildReport;
}

function validPosition(position: BuildPosition): boolean {
  return Number.isSafeInteger(position.line) && position.line >= 0 &&
    Number.isSafeInteger(position.character) && position.character >= 0;
}
