import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface CliConfig {
  apiUrl: string;
  token?: string | undefined;
}

export const defaultApiUrl = "https://papiskill.com";

export function getConfigPath(): string {
  const configHome = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config");
  return path.join(configHome, "papiskill", "config.json");
}

export async function readConfig(): Promise<CliConfig> {
  const configPath = getConfigPath();
  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CliConfig>;
    return {
      apiUrl: parsed.apiUrl ?? process.env.PAPISKILL_API_URL ?? defaultApiUrl,
      token: parsed.token ?? process.env.PAPISKILL_TOKEN,
    };
  } catch {
    return {
      apiUrl: process.env.PAPISKILL_API_URL ?? defaultApiUrl,
      token: process.env.PAPISKILL_TOKEN,
    };
  }
}

export async function writeConfig(config: CliConfig): Promise<void> {
  const configPath = getConfigPath();
  await mkdir(path.dirname(configPath), { recursive: true, mode: 0o700 });
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

export async function clearConfig(): Promise<void> {
  await rm(getConfigPath(), { force: true });
}
