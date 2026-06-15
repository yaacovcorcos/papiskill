import os from "node:os";
import path from "node:path";
import type { AgentTarget, SkillManifest } from "./schema.js";

export interface InstallTargetResolution {
  target: AgentTarget | "custom";
  directory: string;
  source: "manifest" | "preset" | "custom";
}

const defaultTargetDirs: Record<AgentTarget, (skillId: string) => string> = {
  codex: (skillId) => path.join(os.homedir(), ".codex", "skills", skillId),
  "claude-code": (skillId) => path.join(os.homedir(), ".claude", "skills", skillId),
  cursor: (skillId) => path.join(os.homedir(), ".cursor", "skills", skillId),
  "generic-agent": (skillId) => path.join(process.cwd(), ".skills", skillId),
  other: (skillId) => path.join(process.cwd(), ".skills", skillId),
};

export function resolveInstallTarget(
  manifest: Pick<SkillManifest, "id" | "install_targets">,
  options: { target?: AgentTarget; directory?: string },
): InstallTargetResolution {
  if (options.directory) {
    return {
      target: "custom",
      directory: expandHome(options.directory),
      source: "custom",
    };
  }

  const target = options.target ?? "generic-agent";
  const manifestTarget = manifest.install_targets[target];
  if (manifestTarget) {
    return {
      target,
      directory: expandHome(manifestTarget),
      source: "manifest",
    };
  }

  return {
    target,
    directory: defaultTargetDirs[target](manifest.id),
    source: "preset",
  };
}

export function expandHome(input: string): string {
  if (input === "~") {
    return os.homedir();
  }
  if (input.startsWith("~/")) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}
