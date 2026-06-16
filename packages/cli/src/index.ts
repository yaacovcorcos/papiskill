#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { readSkillPackageFromDirectory, validateSkillPackage, type AgentTarget } from "@papiskill/skill-core";
import { getSkill, getMe, installReferenceForSkill, searchSkills } from "./api.js";
import { clearConfig, defaultApiUrl, readConfig, writeConfig } from "./config.js";
import { installSkill } from "./install.js";
import { getInstalledSkill, getInstalledSkills, recordInstall } from "./manifest.js";

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
      console.log(`${installReferenceForSkill(skill)}\t${skill.name}\t${skill.summary}`);
    }
  });

program.command("info")
  .description("Show skill metadata.")
  .argument("<reference>", "skill reference, for example official/code-review or user/code-review")
  .action(async (reference: string) => {
    const config = await commandConfig();
    const skill = await getSkill(config, reference);
    console.log(installReferenceForSkill(skill));
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
    await recordInstall({
      reference,
      name: skill.name,
      slug: skill.slug,
      registryKind: skill.registryKind,
      directory,
      files: skill.files.map((file) => file.path),
      installedAt: new Date().toISOString(),
    });
    console.log(`Installed ${installReferenceForSkill(skill)} to ${directory}`);
  });

program.command("installed")
  .description("List skills installed by this CLI.")
  .action(async () => {
    const skills = await getInstalledSkills();
    if (skills.length === 0) {
      console.log("No skills installed yet. Run `papiskill search` and `papiskill install <reference>`.");
      return;
    }
    for (const skill of skills) {
      console.log(`${skill.reference}\t${skill.name}\t${skill.directory}`);
    }
  });

program.command("update")
  .description("Reinstall an already-installed skill from the live registry.")
  .argument("[reference]", "installed skill reference")
  .option("--all", "update every installed skill")
  .action(async (reference: string | undefined, options: { all?: boolean }) => {
    const config = await commandConfig();
    const installed = options.all
      ? await getInstalledSkills()
      : reference
        ? [await getInstalledSkill(reference)]
        : [];
    const skills = installed.filter((skill): skill is NonNullable<typeof skill> => Boolean(skill));

    if (skills.length === 0) {
      throw new Error(options.all ? "No installed skills to update." : "Provide an installed reference or use --all.");
    }

    for (const entry of skills) {
      const skill = await getSkill(config, entry.reference);
      const directory = await installSkill(skill, { directory: entry.directory });
      await recordInstall({
        reference: entry.reference,
        name: skill.name,
        slug: skill.slug,
        registryKind: skill.registryKind,
        directory,
        files: skill.files.map((file) => file.path),
        installedAt: new Date().toISOString(),
      });
      console.log(`Updated ${entry.reference} in ${directory}`);
    }
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
