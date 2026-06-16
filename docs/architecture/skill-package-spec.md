# Skill Package Specification

## Package Layout

Minimum package:

```text
my-skill/
  skill.yml
  SKILL.md
```

Optional directories:

```text
my-skill/
  docs/
  examples/
  scripts/
  assets/
```

## `skill.yml`

Required fields:

```yaml
id: code-review
name: Code Review
summary: Review code changes for bugs, risk, and missing tests.
description: A longer description of what the skill helps an agent do.
license: MIT
visibility: public
categories:
  - coding
tags:
  - review
  - testing
compatible_with:
  - codex
  - claude-code
  - cursor
  - generic-agent
install_targets:
  codex: ~/.codex/skills/code-review
  claude-code: ~/.claude/skills/code-review
  cursor: ~/.cursor/skills/code-review
```

Recommended fields:

```yaml
homepage: https://example.com
source_url: https://github.com/owner/repo/tree/main/registry/official/code-review
version: 1.0.0
maintainers:
  - github: yaacovcorcos
```

## `SKILL.md`

`SKILL.md` contains the agent-facing instructions. It should be direct, scoped, and portable.

Official PapiSkill skills should include minimal YAML frontmatter for compatibility with common agent runtimes:

```yaml
---
name: code-review
description: Review code changes for bugs, regressions, missing tests, and risky assumptions. Use when asked to review a diff, pull request, patch, branch, or workspace changes.
---
```

`skill.yml` remains the canonical PapiSkill registry manifest. Keep richer metadata such as categories, tags, compatibility, install targets, source URL, and maintainers in `skill.yml`.

Rules:

- Avoid assuming a single agent runtime unless declared in `compatible_with`.
- List required tools or capabilities.
- Keep destructive operations gated by explicit user approval.
- Include examples when helpful.
- Do not include secrets.

## Compatibility Values

Allowed initial values:

- `codex`
- `claude-code`
- `cursor`
- `generic-agent`
- `other`

## Validation Levels

### Errors

Errors block official registry acceptance and default save.

- missing `skill.yml`
- missing `SKILL.md`
- invalid `id`
- invalid or missing `name`
- invalid or missing `summary`
- unsupported compatibility value
- package paths escaping the package root

### Warnings

Warnings are visible but may not block user forks.

- no license
- no examples
- contains scripts
- mentions shell execution
- mentions network access
- very large `SKILL.md`
- likely agent-specific instructions without compatibility metadata

## Export

The web app and CLI support:

- single `SKILL.md` download
- package JSON representation
- directory install through CLI
