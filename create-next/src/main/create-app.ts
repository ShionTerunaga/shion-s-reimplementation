import { basename, resolve, join } from "node:path";
import type { RepoInfo } from "./helper/examples";
import type { TemplateMode, TemplateType } from "../templates/types";
import { isWriteable } from "./helper/is-writeable";
import { mkdirSync } from "node:fs";
import { isFolderEmpty } from "./helper/is-folder-empty";
import { green } from "picocolors";
import { installTemplate } from "../templates";

export async function createApp({
  appPath,
  typescript,
  eslint,
  app,
  srcDir,
  importAlias,
}: {
  appPath: string;
  typescript: boolean;
  eslint: boolean;
  app: boolean;
  srcDir: boolean;
  importAlias: string;
}) {
  const mode: TemplateMode = typescript ? "ts" : "js";
  const template: TemplateType = app ? "app" : "default";

  const root = resolve(appPath);

  const appName = basename(appPath);

  mkdirSync(root, { recursive: true });

  if (!(await isWriteable(root))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );

    process.exit(1);
  }

  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  console.log(`Creating a new Next.js app in ${green(root)}.`);
  console.log();

  process.chdir(root);

  const packageJsonPath = join(root, "package.json");

  await installTemplate({
    appName,
    root,
    template,
    mode,
    eslint,
    srcDir,
    importAlias,
  });

  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);
}
