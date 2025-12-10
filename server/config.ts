import { resolve, join } from "path";
import { defineConfig, type BifbofConfig } from "./types";

const CONFIG_FILES = ["bifbof.config.ts", "bifbof.config.js"] as const;

async function findConfig(cwd: string): Promise<string | null> {
  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);
    if (await Bun.file(filepath).exists()) return filepath;
  }
  return null;
}

export async function loadConfig(customPath?: string): Promise<BifbofConfig> {
  const cwd = process.cwd();

  const configPath = customPath
    ? resolve(cwd, customPath)
    : await findConfig(cwd);

  if (!configPath) {
    console.log("No config found, using defaults");
    return defineConfig({});
  }

  console.log(`Loading config from ${configPath}`);
  const mod = await import(configPath);
  return defineConfig(mod.default ?? mod);
}
