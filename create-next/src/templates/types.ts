export type TemplateType = "app" | "default";

export type TemplateMode = "js" | "ts";

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  template: TemplateType;
  mode: TemplateMode;
  eslint: boolean;
  srcDir: boolean;
  importAlias: string;
}
