import { rename, rm } from "node:fs/promises";

export async function replaceFile(destination: string, temporary: string): Promise<void> {
  const backup = `${destination}.bak`;
  let moved = false;
  await rm(backup, { force: true });
  try {
    try {
      await rename(destination, backup);
      moved = true;
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
    try {
      await rename(temporary, destination);
    } catch (error) {
      if (moved) await rename(backup, destination);
      throw error;
    }
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  if (moved) await rm(backup, { force: true });
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
