import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveInstallTarget, type AgentTarget } from "@papiskill/skill-core";
import type { ApiSkillDetail } from "./api.js";

export interface InstallOptions {
  target?: AgentTarget | undefined;
  directory?: string | undefined;
}

export async function installSkill(skill: ApiSkillDetail, options: InstallOptions): Promise<string> {
  const resolutionOptions = {
    ...(options.target ? { target: options.target } : {}),
    ...(options.directory ? { directory: options.directory } : {}),
  };
  const resolution = resolveInstallTarget({
    id: skill.slug,
    install_targets: skill.installTargets,
  }, resolutionOptions);

  await mkdir(resolution.directory, { recursive: true });

  for (const file of skill.files) {
    const destination = path.join(resolution.directory, file.path);
    if (!destination.startsWith(path.resolve(resolution.directory))) {
      throw new Error(`Refusing to write outside install directory: ${file.path}`);
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.content, "utf8");
  }

  return resolution.directory;
}
