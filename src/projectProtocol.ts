export interface ProjectReport {
  schemaVersion: number;
  root: string;
  manifest: string;
  entry: string;
  profile: string;
  build: string;
  runtime: string;
}

export function readProjectReport(value: string): ProjectReport {
  const report = JSON.parse(value) as Partial<ProjectReport>;
  if (report.schemaVersion !== 1) throw new Error("Unsupported project report.");
  for (const key of ["root", "manifest", "entry", "profile", "build", "runtime"] as const) {
    if (typeof report[key] !== "string") throw new Error(`Invalid project ${key}.`);
  }
  return report as ProjectReport;
}
