---
name: skill-authoring
description: Create or improve portable agent skills with clear trigger metadata, focused instructions, bundled resources, safety boundaries, and real validation. Use when writing, reviewing, refactoring, packaging, or publishing a SKILL.md skill for PapiSkill, Codex, Claude Code, Factory, GitHub Copilot, Cursor, VS Code, or another agent runtime.
---

# Skill Authoring

Use this skill to create, improve, review, or package an agent skill.

A good skill gives a capable agent the missing procedural knowledge it needs to do a repeatable job well. It should not micromanage obvious reasoning, restate generic best practices, or bury the agent in ceremony.

## Core Judgment

Write for an intelligent agent with limited context.

The skill should answer:

- what reusable capability this adds
- when the agent should load it
- what source material or tools it needs
- what workflow or judgment it should follow
- what outputs or evidence prove the work is complete
- what actions are unsafe without explicit user approval

If a section would not change agent behavior, remove it.

## PapiSkill Package Policy

A PapiSkill package contains:

```text
skill-name/
|-- skill.yml
`-- SKILL.md
```

Optional directories:

```text
docs/
examples/
scripts/
assets/
```

Use `skill.yml` as PapiSkill's canonical registry metadata. Use `SKILL.md` as the portable runtime entry point.

Official PapiSkill skills should include minimal `SKILL.md` frontmatter for cross-runtime compatibility:

```markdown
---
name: skill-name
description: What the skill does. Use when the user asks for specific trigger cases, file types, tools, or workflows.
---
```

Keep `SKILL.md` frontmatter minimal and portable. Put richer registry fields such as license, categories, tags, compatibility, install targets, source URL, and maintainers in `skill.yml`.

## Start With Real Use

Before writing, understand the skill from concrete examples.

Collect enough to know:

- typical user requests that should trigger the skill
- near-miss requests that should not trigger it
- expected output or artifact
- required tools, files, data, accounts, or runtime permissions
- likely failure modes
- whether the skill is broad reusable expertise, a precise workflow, or both

Ask the user only for answers that change scope, safety, output, or required resources. If the missing detail is minor, make a reasonable assumption and label it.

## Decide Whether This Should Be A Skill

Create a skill when the workflow is repeatable and benefits from reusable instructions, resources, or safety boundaries.

Good skill candidates:

- repeated workflows users keep pasting into chat
- team or project conventions that should be followed consistently
- domain knowledge an agent would not reliably infer
- workflows involving bundled templates, scripts, schemas, or references
- tasks where validation or safety gates matter

Poor skill candidates:

- one-off tasks
- generic advice the model already knows
- broad personality instructions
- raw product docs with no workflow
- tool access that belongs in MCP, OAuth, an API integration, or a plugin

Use skills to teach how work should be done. Use MCP/tools to connect to external systems. Use app or agent configuration to control model, permissions, or global behavior.

## Write The Trigger Contract

The description is the most important part of the skill. Many runtimes load only the skill name and description before deciding whether to read the full body.

A strong description:

- starts with the capability
- includes concrete trigger words and contexts
- names important exclusions when confusion is likely
- front-loads the key terms in case the runtime truncates long descriptions
- avoids summarizing process steps the agent might follow instead of loading the skill

Good:

```yaml
description: Review local code changes for bugs, regressions, missing tests, and risky assumptions. Use when asked to review a diff, pull request, patch, branch, or uncommitted workspace changes before promotion.
```

Weak:

```yaml
description: Helps with code.
```

For PapiSkill, keep `skill.yml.summary` human-facing and concise. Put the full trigger contract in both `skill.yml.description` and `SKILL.md` frontmatter `description`.

## Set The Right Degree Of Freedom

Do not make every skill a rigid checklist.

Choose the level of control based on fragility:

- high freedom: judgment-heavy writing, research, design, planning, review
- medium freedom: preferred workflows with room for local adaptation
- low freedom: fragile, repetitive, deterministic, or dangerous operations

Use prose for judgment. Use checklists for workflows where steps are easy to skip. Use scripts for deterministic work.

Before adding a rule, ask what failure it prevents or what better judgment it enables. Stable rules can be unconditional; situational guidance should name the condition that activates it and, when useful, the reason it matters. Heavy procedure belongs only in the branch where that rigor is needed.

Avoid rules that are merely sometimes true. Prefer first principles, examples, and scoped decision points that help the agent adapt intelligently when the user's request, available tools, risk level, or desired depth changes.

## Structure SKILL.md

Prefer this shape, adapting headings when another structure reads better:

```markdown
# Skill Name

Use this skill when...

## Core Judgment

What matters most.

## Workflow

The main process.

## Resources

When to read or run supporting files.

## Safety

Actions that require care or approval.

## Verification

Evidence that the skill worked.
```

Include "when not to use" only when the boundary is likely to be confused.

Do not add sections just because a template has them.

## Progressive Disclosure

Keep the main `SKILL.md` focused. Move detailed or conditional material into supporting files when it would distract from the core workflow.

Use one-level-deep references from `SKILL.md`:

```markdown
For provider-specific setup, read [docs/aws.md](docs/aws.md) or [docs/gcp.md](docs/gcp.md) only when that provider is relevant.
```

Good reasons to split files:

- long reference material
- multiple domains or providers
- rarely used advanced behavior
- templates or examples
- scripts the agent should run rather than rewrite

Bad reasons to split files:

- copying a boilerplate directory shape
- hiding essential instructions
- creating README, changelog, install guide, or extra docs that do not affect agent behavior

Every supporting file must be discoverable from `SKILL.md` with a clear "read this when..." condition.

## Bundled Resources

Use resources intentionally.

### `docs/`

Use for source reviews, policy notes, schemas, detailed references, or long examples that should be read only when relevant.

### `examples/`

Use when output shape, trigger behavior, or edge cases are easy to misunderstand.

Include compact examples of:

- user request
- what the skill should do
- expected output shape
- mistakes to avoid

### `scripts/`

Use scripts when the operation is deterministic, repetitive, fragile, or easier to verify in code.

Scripts must be inspectable and tested. Do not include scripts that contact external services, mutate production, or handle credentials unless the skill clearly documents the risk and requires user approval.

### `assets/`

Use for templates, sample files, images, starter projects, or other files the agent should copy or transform. Assets are not instructions; explain in `SKILL.md` when to use them.

## Safety Policy

Before publishing, classify the skill's risk.

Look for:

- shell commands or scripts
- file writes outside the current project
- network calls or downloads
- credentials, tokens, secrets, SSH keys, private URLs, or API keys
- private company, customer, medical, legal, financial, or personal data
- production deploys, deletes, migrations, billing, messages, or notifications
- dependency installation or supply-chain risk

If the skill can cause side effects, state what requires explicit user approval.

If the skill includes scripts or external resources, treat it like installable software. Users should be able to inspect what it does before running it.

## Portability Review

A portable skill should not assume one agent runtime unless it declares that dependency.

Check compatibility with:

- PapiSkill package contract: `skill.yml` plus `SKILL.md`
- common skill frontmatter: `name` and `description`
- lowercase hyphenated skill name matching the directory
- relative links to bundled files
- no hard dependency on Codex, Claude Code, Factory, Copilot, Cursor, VS Code, or another runtime unless stated
- graceful behavior when optional tools are missing

Runtime-specific features such as invocation controls, subagent execution, pre-approved tools, or dynamic context can be mentioned as optional notes, not required for the portable core.

## Validation And Forward Testing

Do not trust a skill because it looks good.

Minimum validation:

- package parses
- `skill.yml` matches directory and `SKILL.md` frontmatter
- required files exist
- links to bundled files resolve
- scripts, if any, run on representative input
- no placeholder text remains
- safety risks are documented

Forward-test important skills with realistic prompts:

1. Give a fresh agent the skill and a realistic task.
2. Do not leak the intended answer or your critique.
3. Review whether the skill triggered, what it read, what it skipped, and what output it produced.
4. Update the skill based on real failure modes.

For high-risk or public official skills, test at least:

- a normal request
- a near-miss request that should not trigger
- an edge case that stresses safety or output quality

## Review Checklist

Before publishing, verify:

- the skill solves a repeatable real problem
- `name` is short, lowercase, and hyphenated
- description includes both capability and trigger conditions
- `skill.yml` and `SKILL.md` frontmatter agree
- `SKILL.md` is focused enough to inspect quickly
- supporting files are referenced directly from `SKILL.md`
- examples exist when behavior is easy to misunderstand
- scripts exist only when they improve reliability
- safety risks and approval gates are explicit
- the skill avoids secrets, private URLs, and organization-only assumptions unless scoped as private
- validation and forward-testing results are recorded or summarized

## Final Response

When creating or improving a skill, report:

- skill name and path
- what changed
- source or policy decisions used
- validation run
- forward-testing performed or deliberately skipped
- remaining risks or open questions
