# Source Review

This skill was rewritten from high-quality public guidance and local examples, without copying their text.

## Sources Considered

- Factory Skills documentation: skills are flexible, composable, token-efficient capabilities that can be invoked by users or agents; they encode team playbooks as git-shareable workflows.
- Factory-AI/skills examples: self-contained folders with `SKILL.md`, clear metadata, focused workflows, and testing disclaimers.
- Anthropic skill authoring best practices: concise skills, progressive disclosure, degree-of-freedom choices, scripts for deterministic work, and iteration from real usage.
- Anthropic engineering article on Agent Skills: skills as onboarding guides, name/description as startup metadata, additional files loaded as needed, and code execution for reliable deterministic work.
- Agent Skills specification: portable `SKILL.md` frontmatter, supporting files, progressive disclosure, and shallow references.
- OpenAI Codex Agent Skills docs: descriptions may be shortened in large skill sets, so trigger language should be front-loaded.
- GitHub Copilot and VS Code docs: directory naming, `SKILL.md`, optional scripts/resources, project and user skill scopes, and preview-before-install behavior.
- Matt Pocock's `write-a-skill`: practical description requirements, when to split files, and when to add scripts.
- Addy Osmani's agent-skills: skills should be specific, verifiable, battle-tested, and minimal.
- Local P_A skills: concise operational skills with clear rules, procedures, and verification sections.

## Policy Decisions

- PapiSkill keeps `skill.yml` as canonical registry metadata.
- Official PapiSkill skills should also include minimal `SKILL.md` frontmatter with `name` and `description` for cross-runtime portability.
- The skill avoids rigid mandatory templates. It teaches judgment, workflow, safety, and validation.
- Factory's policies are treated as high-quality inspiration, but the final skill remains agent-agnostic and portable.
- Scripts are recommended only for deterministic, repetitive, fragile, or verification-heavy work.
- Forward-testing is part of the official quality bar for important skills.

## Rejected Ideas

- Requiring every skill to include large anti-rationalization tables.
- Treating every skill as a slash command.
- Making Factory-specific frontmatter required in portable skills.
- Putting all metadata in `SKILL.md` and removing PapiSkill's `skill.yml`.
- Adding decorative README, changelog, or install docs inside each skill package.
