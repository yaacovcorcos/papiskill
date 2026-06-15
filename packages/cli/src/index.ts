#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { readSkillPackageFromDirectory, validateSkillPackage, type AgentTarget } from "@papiskill/skill-core";
import { getSkill, getMe, searchSkills } from "./api.js";
import { clearConfig, defaultApiUrl, readConfig, writeConfig } from "./config.js";
import { installSkill } from "./install.js";

const program = new Command();

program
  .name("papiskill")
  .description("Search, install, download, and validate portable SKILL.md packages.")
  .version("0.1.0")
  .option("--api-url <url>", "PapiSkill API URL", defaultApiUrl);

program.command("search")
  .description("Search public PapiSkill registry entries.")
  .argument("[query]", "search query", "")
  .action(async (query: string) => {
    const config = await commandConfig();
    const skills = await searchSkills(config, query);
    for (const skill of skills) {
      console.log(`${skill.registryKind}/${skill.slug}\t${skill.name}\t${skill.summary}`);
    }
  });

program.command("info")
  .description("Show skill metadata.")
  .argument("<reference>", "skill reference, for example official/code-review or user/code-review")
  .action(async (reference: string) => {
    const config = await commandConfig();
    const skill = await getSkill(config, reference);
    console.log(`${skill.registryKind}/${skill.slug}`);
    console.log(skill.name);
    console.log(skill.summary);
    console.log(`Compatible with: ${skill.compatibleWith.join(", ")}`);
    console.log(`Tags: ${skill.tags.join(", ") || "none"}`);
  });

program.command("install")
  .description("Install a skill package into a selected agent target or custom directory.")
  .argument("<reference>", "skill reference")
  .option("--target <target>", "codex, claude-code, cursor, generic-agent, other")
  .option("--dir <directory>", "custom install directory")
  .action(async (reference: string, options: { target?: AgentTarget; dir?: string }) => {
    const config = await commandConfig();
    const skill = await getSkill(config, reference);
    const directory = await installSkill(skill, {
      target: options.target,
      directory: options.dir,
    });
    console.log(`Installed ${skill.registryKind}/${skill.slug} to ${directory}`);
  });

program.command("download")
  .description("Print a skill package JSON payload to stdout.")
  .argument("<reference>", "skill reference")
  .action(async (reference: string) => {
    const config = await commandConfig();
    const skill = await getSkill(config, reference);
    console.log(JSON.stringify(skill, null, 2));
  });

program.command("validate")
  .description("Validate a local skill package directory.")
  .argument("<directory>", "local package directory")
  .action(async (directory: string) => {
    const skillPackage = await readSkillPackageFromDirectory(directory);
    const result = validateSkillPackage(skillPackage.files);
    for (const issue of result.issues) {
      console.log(`${issue.level.toUpperCase()} ${issue.code}: ${issue.message}`);
    }
    if (!result.ok) {
      process.exitCode = 1;
      return;
    }
    console.log(`Valid skill package: ${skillPackage.manifest.id}`);
  });

program.command("login")
  .description("Store a PapiSkill API token for private installs.")
  .argument("<token>", "API token created from the PapiSkill dashboard")
  .action(async (token: string) => {
    const config = await commandConfig();
    await writeConfig({ ...config, token });
    console.log("Token saved. Run `papiskill whoami` to verify it.");
  });

program.command("whoami")
  .description("Show the authenticated CLI user.")
  .action(async () => {
    const config = await commandConfig();
    const me = await getMe(config);
    console.log(`${me.handle}${me.name ? ` (${me.name})` : ""}`);
  });

program.command("logout")
  .description("Remove saved CLI credentials.")
  .action(async () => {
    await clearConfig();
    console.log("Logged out.");
  });

program.command("doctor")
  .description("Show local CLI configuration.")
  .action(async () => {
    const config = await commandConfig();
    console.log(`API: ${config.apiUrl}`);
    console.log(`Config token: ${config.token ? "present" : "missing"}`);
  });

async function commandConfig() {
  const opts = program.opts<{ apiUrl?: string }>();
  const config = await readConfig();
  return {
    ...config,
    apiUrl: opts.apiUrl ?? config.apiUrl,
  };
}

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
