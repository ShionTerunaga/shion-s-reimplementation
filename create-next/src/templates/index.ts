import { bold, cyan } from "picocolors";
import type { InstallTemplateArgs } from "./types";
import { copy } from "../main/helper/copy";
import path from "path";
import fs from "fs/promises";
import { Sema } from "async-sema";
import { async as glob } from "fast-glob";
import os from "os";

interface DevDependencies {
  devDependencies?: Record<string, string | undefined>;
}

interface Dependencies {
  dependencies: Record<string, string | undefined>;
}

type PackageDict = DevDependencies &
  Dependencies &
  Record<
    string,
    string | boolean | Record<string, string | undefined> | undefined
  >;

const nextjsReactPeerVersion = "19.1.0";
export const SRC_DIR_NAMES = ["app", "pages", "styles"];

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

  //エイリアスの設定がデフォルトではない
  if (importAlias !== "@/*") {
    const files = await glob("**/*", {
      cwd: root,
      dot: true,
      stats: false,

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

  if (srcDir) {
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await Promise.all(
      SRC_DIR_NAMES.map(async (file) => {
        await fs
          .rename(path.join(root, file), path.join(root, "src", file))
          .catch((err) => {
            if (err.code !== "ENOENT") throw err;
          });
      }),
    );
  }

  //package.jsonの作成
  const packageJson: PackageDict = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: eslint ? "next lint" : undefined,
    },
    dependencies: {
      react: nextjsReactPeerVersion,
      "react-dom": nextjsReactPeerVersion,
      next: "15.5.2",
    },
    devDependencies: {},
  };

  if (mode === "ts") {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      typescript: "^5",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
    };
  }

  if (eslint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: "^9",
      "eslint-config-next": "15.5.2",
      // TODO: Remove @eslint/eslintrc once eslint-config-next is pure Flat config
      "@eslint/eslintrc": "^3",
    };
  }

  const devDeps = packageJson.devDependencies
    ? Object.keys(packageJson.devDependencies).length
    : 0;

  if (devDeps < 1) delete packageJson.devDependencies;

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies)
    console.log(`- ${cyan(dependency)}`);

  if (devDeps) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in packageJson.devDependencies)
      console.log(`- ${cyan(dependency)}`);
  }

  console.log();
  //nextはinstallするけどしない
};
