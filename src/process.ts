import { spawn } from "node:child_process";

export interface ProcessResult {
  code: number;
  stdout: string;
  stderr: string;
}

export function run(executable: string, args: readonly string[], cwd?: string, maxBytes = 1024 * 1024, signal?: AbortSignal): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, [...args], { cwd, shell: false, signal, windowsHide: true });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let bytes = 0;
    let settled = false;
    const append = (chunks: Buffer[], chunk: Buffer): void => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        if (settled) return;
        settled = true;
        child.kill();
        reject(new Error("tool output exceeded 1 MiB"));
        return;
      }
      chunks.push(chunk);
    };
    child.stdout.on("data", (chunk: Buffer) => append(stdout, chunk));
    child.stderr.on("data", (chunk: Buffer) => append(stderr, chunk));
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      resolve({ code: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") });
    });
  });
}
