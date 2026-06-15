import { loadRegistry } from "./registry-loader.js";
import { validateSkillPackage } from "./validation.js";

const registryRoot = process.argv[2] ?? "registry";
const packages = await loadRegistry(registryRoot);
let failures = 0;

for (const skillPackage of packages) {
  const result = validateSkillPackage(skillPackage.files);
  const heading = `${skillPackage.registryKind}/${skillPackage.manifest.id}`;
  if (!result.ok) {
    failures += 1;
    console.error(`FAIL ${heading}`);
  } else {
    console.log(`OK   ${heading}`);
  }

  for (const issue of result.issues) {
    const prefix = issue.level === "error" ? "  error" : "  warn ";
    console.log(`${prefix} ${issue.code}: ${issue.message}`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}
