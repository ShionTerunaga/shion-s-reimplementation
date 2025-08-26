import { basename, resolve } from "node:path";
import { Command } from "commander";
import Conf from "conf";
import prompts, { type InitialReturnValue } from "prompts";
import { existsSync } from "node:fs";
import ciInfo from "ci-info";

import { validateNpmName } from "./helper/validate-pkg";
import { blue, bold, red } from "picocolors";
import { isFolderEmpty } from "./helper/is-folder-empty";

export let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGTERM", handleSigTerm);
process.on("SIGINT", handleSigTerm);

const onPromptState = (state: {
  value: InitialReturnValue;
  aborted: boolean;
  exited: boolean;
}) => {
  if (state.aborted) {
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Command("create-next")
  .version("0.1.0", "-v, --version", "output the current version")
  .argument("[directory]")
  .usage("[directory] [options]")
  .helpOption("-h, --help", "display help for command")
  .action((name) => {
    // create-next my-appで実行したばいこのあと条件に入る
    if (name && !name.startsWith("--no-")) {
      projectPath = name;
    }
  })
  .allowUnknownOption() //知らないオプションの場合も無視.
  .parse(process.argv);

const opts = program.opts();

export async function run(): Promise<void> {
  const conf = new Conf({ projectName: "create-template" });

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (nama: string): boolean | string => {
        const validation = validateNpmName(nama);

        if (validation.valid) {
          return true;
        }

        return `Invalid project name: ${validation.problems?.join(", ")}`;
      },
    });

    //なんかこれpromptの型をちゃんと補完できてたらいいなと思った
    if (res.path) {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log("Please enter the project name");
    process.exit(1);
  }

  const appPath = resolve(projectPath);
  const appName = basename(appPath);

  const validation = validateNpmName(appName);

  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );

    validation.problems?.forEach((p) =>
      console.error(`    ${red(bold("*"))} ${p}`)
    );

    process.exit(1);
  }

  if (opts.example === true) {
    console.error(
      "Please provide an example name or url, otherwise remove the example option."
    );
    process.exit(1);
  }

  if (existsSync(appName) && !isFolderEmpty(appPath, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;
  const skipPrompt = ciInfo.isCI;

  const defaults: typeof preferences = {
    typescript: true,
    eslint: false,
    srcDir: true,
    importAlias: "@/*",
    customizeImportAlias: false,
    empty: false,
  };

  const getPrefOrDefault = (field: string) =>
    preferences[field] ?? defaults[field];

  const styledTypeScript = blue("Typescript");
  const { typescript } = await prompts(
    {
      type: "toggle",
      name: "typescript",
      message: `Would you like to use ${styledTypeScript}?`,
      initial: getPrefOrDefault("typescript"),
      active: "Yes",
      inactive: "No",
    },
    {
      onCancel: () => {
        console.error("Exiting");
        process.exit(1);
      },
    }
  );
  preferences.typescript = Boolean(typescript);

  const styledEslint = blue("ESLint");

  const { eslint } = await prompts({
    onState: onPromptState,
    type: "toggle",
    name: "eslint",
    message: `Would you like to use ${styledEslint}?`,
    initial: getPrefOrDefault("eslint"),
    active: "Yes",
    inactive: "No",
  });
  preferences.eslint = Boolean(eslint);

  const styledSrcDir = blue("`src/` directory");
  const { srcDir } = await prompts({
    onState: onPromptState,
    type: "toggle",
    name: "srcDir",
    message: `Would you like your code inside a ${styledSrcDir}?`,
    initial: getPrefOrDefault("srcDir"),
    active: "Yes",
    inactive: "No",
  });

  preferences.srcDir = Boolean(srcDir);

  const styledAppDir = blue("App Router");
  const { app } = await prompts({
    onState: onPromptState,
    type: "toggle",
    name: "app",
    message: `Would you like to use ${styledAppDir}? (recommended)`,
    initial: getPrefOrDefault("app"),
    active: "Yes",
    inactive: "No",
  });
  preferences.app = Boolean(app);

  const importAliasPattern = /^[^*"]+\/\*\s*$/;

  const styledImportAlias = blue("import alias");

  const { customizeImportAlias } = await prompts({
    onState: onPromptState,
    type: "toggle",
    name: "customizeImportAlias",
    message: `Would you like to customize the ${styledImportAlias} (\`${defaults.importAlias}\` by default)?`,
    initial: getPrefOrDefault("customizeImportAlias"),
    active: "Yes",
    inactive: "No",
  });

  if (!customizeImportAlias) {
    // We don't use preferences here because the default value is @/* regardless of existing preferences
    opts.importAlias = defaults.importAlias;
  } else {
    const { importAlias } = await prompts({
      onState: onPromptState,
      type: "text",
      name: "importAlias",
      message: `What ${styledImportAlias} would you like configured?`,
      initial: getPrefOrDefault("importAlias"),
      validate: (value: string) =>
        importAliasPattern.test(value)
          ? true
          : "Import alias must follow the pattern <prefix>/*",
    });
    preferences.importAlias = importAlias;
  }

  console.log(preferences);
}
