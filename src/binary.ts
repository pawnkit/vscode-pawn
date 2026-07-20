import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { posix, win32 } from "node:path";

export interface ResolveOptions {
  configured?: string;
  name: string;
  managed?: string;
  platform?: NodeJS.Platform;
  path?: string;
  workspace?: string;
}

export function executableName(name: string, platform = process.platform): string {
  return platform === "win32" && !name.endsWith(".exe") ? `${name}.exe` : name;
}

export function candidates(options: ResolveOptions): string[] {
  const platform = options.platform ?? process.platform;
  const paths = platform === "win32" ? win32 : posix;
  const name = executableName(options.name, platform);
  const configured = options.configured?.trim();
  if (configured) {
    return [paths.isAbsolute(configured) || !options.workspace ? configured : paths.join(options.workspace, configured)];
  }
  const delimiter = platform === "win32" ? ";" : ":";
  return (options.path ?? process.env.PATH ?? "")
    .split(delimiter)
    .filter(Boolean)
    .map((directory) => paths.join(directory, name));
}

export async function resolveBinary(options: ResolveOptions): Promise<string> {
  const mode = (options.platform ?? process.platform) === "win32" ? constants.F_OK : constants.X_OK;
  for (const candidate of candidates(options)) {
    try {
      await access(candidate, mode);
      return candidate;
    } catch {
    }
  }
  if (options.managed && !options.configured?.trim()) {
    try {
      await access(options.managed, mode);
      return options.managed;
    } catch {
    }
  }
  throw new Error(`${options.name} was not found. Set pawn.${binarySetting(options.name)}.path or add it to PATH.`);
}

function binarySetting(name: string): string {
  if (name === "pawnlsp") return "server";
  if (name === "pawndebug") return "debug";
  if (name === "pawntest") return "test";
  return "cli";
}
