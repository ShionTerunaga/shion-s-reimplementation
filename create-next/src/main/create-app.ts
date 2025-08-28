import { basename, resolve } from "node:path";
import type { RepoInfo } from "./helper/examples";
import type { TemplateMode, TemplateType } from "../templates/types";
import { isWriteable } from "./helper/is-writeable";
import { mkdirSync } from "node:fs";
import { isFolderEmpty } from "./helper/is-folder-empty";

export async function createApp({
  appPath,
  examplePath,
  typescript,
  eslint,
  app,
  srcDir,
  importAlias,
}: {
  appPath: string;
  examplePath?: string;
  typescript: boolean;
  eslint: boolean;
  app: boolean;
  srcDir: boolean;
  importAlias: string;
}) {
  let repoInfo: RepoInfo | undefined;
  const mode: TemplateMode = typescript ? "ts" : "js";
  const template: TemplateType = app ? "app" : "default";

  const root = resolve(appPath);

  if (!(await isWriteable(root))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );

    process.exit(1);
  }

  const appName = basename(appPath);

  mkdirSync(root, { recursive: true });

  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }
}
