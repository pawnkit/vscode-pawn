export interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip" | "error" | "xfail" | "xpass";
  message?: string;
  warnings?: string[];
  duration_ms: number;
}

export interface TestReport {
  results: TestResult[];
}

export function testRunArgs(ids: readonly string[]): string[] {
  const alternatives = ids.map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return ["test", "--format", "json", "--run", `^(?:${alternatives.join("|")})$`];
}

export function parseTestReport(value: string): TestReport {
  const report = JSON.parse(value) as TestReport;
  if (!report || !Array.isArray(report.results)) throw new Error("invalid pawntest report");
  return report;
}

export function formatTestResult(result: TestResult, label: string): string {
  const lines = [`${result.status.toUpperCase()} ${label} (${result.duration_ms}ms)`];
  if (result.message) lines.push(...result.message.split(/\r?\n/).map((line) => `  ${line}`));
  for (const warning of result.warnings ?? []) lines.push(`  warning: ${warning}`);
  return `${lines.join("\r\n")}\r\n`;
}
