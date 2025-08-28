import { access } from "node:fs/promises";

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    await access(directory);
    return true;
  } catch {
    return false;
  }
}
