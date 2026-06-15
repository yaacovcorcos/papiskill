# Skill Authoring

Use this skill to create or improve a portable `SKILL.md` package.

## Goals

A good skill is:

- specific enough to trigger at the right time
- portable across agent setups unless it declares a specific runtime
- honest about required tools and permissions
- clear about inputs, outputs, and safety boundaries
- short enough to inspect
- detailed enough to reproduce the workflow

## Package checklist

Every package should include:

- `skill.yml` with id, name, summary, description, categories, tags, license, compatibility, and install targets
- `SKILL.md` with agent-facing instructions
- examples when the workflow is easy to misunderstand
- scripts only when they are necessary and inspectable

## Writing rules

- Use direct instructions.
- Prefer concrete steps over motivational language.
- Name when to use the skill and when not to use it.
- Mention required tools explicitly.
- Gate destructive actions behind user approval.
- Avoid secrets, credentials, private URLs, and organization-only assumptions.

## Safety review

Before publishing, check whether the skill:

- asks the agent to run shell commands
- reads private files
- writes outside the current project
- sends data over the network
- stores credentials
- changes production systems

If any of those are true, document the risk plainly.
