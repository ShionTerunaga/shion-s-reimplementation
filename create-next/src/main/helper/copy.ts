import { async as glob } from "fast-glob";
import { basename, dirname, resolve, join } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";

interface CopyOptions {
  cwd?: string;
  rename?: (basename: string) => string;
  parents?: boolean;
}

const identity = (x: string) => x;

export const copy = async (
  src: string | string[],
  dest: string,
  { cwd, rename = identity, parents = true }: CopyOptions
) => {
  const source = typeof src === "string" ? [src] : src;

  if (source.length === 0 || !dest) {
    throw new Error("Source and destination must be provided");
  }

  const sourceFiles = await glob(source, {
    cwd,
    dot: true,
    absolute: false,
    stats: false,
  });

  const destRelativeToCwd = cwd ? resolve(cwd, dest) : dest;

  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirName = dirname(p);
      const baseName = rename(basename(p));

      const from = cwd ? resolve(cwd, p) : p;
      const to = parents
        ? join(destRelativeToCwd, dirName, baseName)
        : join(destRelativeToCwd, baseName);

      await mkdir(dirname(to), { recursive: true });

      return copyFile(from, to);
    })
  );
};
