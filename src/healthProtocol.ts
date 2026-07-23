export interface DoctorRemediation {
  class: "safe" | "review-required";
  command?: string;
  message: string;
}

export interface DoctorFinding {
  id: string;
  severity: "error" | "warning";
  certainty: "confirmed" | "inferred" | "heuristic";
  source: string;
  path?: string;
  message: string;
  remediation?: DoctorRemediation;
}

export interface DoctorReport {
  schemaVersion: number;
  findings: DoctorFinding[];
}

export function readDoctorReport(value: string): DoctorReport {
  const report = JSON.parse(value) as Partial<DoctorReport>;
  if (report.schemaVersion !== 1 || !Array.isArray(report.findings)) throw new Error("Unsupported doctor report.");
  for (const finding of report.findings) {
    if (!finding || typeof finding.id !== "string" || typeof finding.message !== "string") throw new Error("Invalid doctor finding.");
  }
  return report as DoctorReport;
}
