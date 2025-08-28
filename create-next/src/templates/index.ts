import { bold } from "picocolors";
import type { InstallTemplateArgs } from "./types";
import { copy } from "../main/helper/copy";
import path from "path";
import fs from "fs/promises";
import { Sema } from "async-sema";
import { async as glob } from "fast-glob";

export const installTemplate = async ({
  appName,
  root,
  template,
  mode,
  eslint,
  srcDir,
  importAlias,
}: InstallTemplateArgs) => {
  console.log(bold(`Using pnpm.`));
  const copySource = ["**"];
  const templatePath = path.join(__dirname, template, mode);

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename: (name) => {
      switch (name) {
        case "gitignore": {
          return `.${name}`;
        }
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  const tsconfigFile = path.join(
    root,
    mode === "js" ? "jsconfig.json" : "tsconfig.json",
  );

  await fs.writeFile(
    tsconfigFile,
    (await fs.readFile(tsconfigFile, "utf-8"))
      .replace(`"@/*":["./*]`, srcDir ? `"@/*": ["./src/*"]` : `"@/*": ["./*"]`)
      .replace(`"@/*": ["./src/*"]`, `"${importAlias}:`),
  );

  if (importAlias !== "@/*") {
    const files = await glob("**/*", {
      cwd: root,
      dot: true,
      stats: false,
      // We don't want to modify compiler options in [ts/js]config.json
      // and none of the files in the .git folder
      // TODO: Refactor this to be an allowlist, rather than a denylist,
      // to avoid corrupting files that weren't intended to be replaced

      ignore: [
        "tsconfig.json",
        "jsconfig.json",
        ".git/**/*",
        "**/fonts/**",
        "**/favicon.ico",
      ],
    });
    const writeSema = new Sema(8, { capacity: files.length });
    await Promise.all(
      files.map(async (file: string) => {
        await writeSema.acquire();
        const filePath = path.join(root, file);
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (
              await fs.readFile(filePath, "utf8")
            ).replace(`@/`, `${importAlias.replace(/\*/g, "")}`),
          );
        }
        writeSema.release();
      }),
    );
  }
};
