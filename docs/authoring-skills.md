# Authoring skills

A PapiSkill package is a portable folder:

```text
my-skill/
  skill.yml
  SKILL.md
```

Optional directories:

```text
docs/
examples/
scripts/
assets/
```

## Metadata

`skill.yml` should include:

- `id`
- `name`
- `summary`
- `description`
- `version`
- `license`
- `categories`
- `tags`
- `compatible_with`
- `install_targets`
- `maintainers`

See [the package spec](./architecture/skill-package-spec.md).

## Runtime frontmatter

Official PapiSkill skills should include minimal `SKILL.md` frontmatter for portability across common agent runtimes:

```markdown
---
name: my-skill
description: What the skill does. Use when the user asks for the concrete trigger cases this skill handles.
---
```

Keep `skill.yml` as the canonical PapiSkill registry manifest. Use `SKILL.md` frontmatter only for runtime discovery fields that other agents expect.

## Writing quality

Good skills are direct, scoped, inspectable, and portable.

Include:

- when to use the skill
- expected inputs
- expected outputs
- safety boundaries
- required tools
- examples for tricky workflows

Avoid:

- secret values
- private URLs
- unexplained shell commands
- assuming one agent runtime unless declared
- broad motivational prose

## In-app drafts

Signed-in users can create a new private skill from the dashboard library. The app creates a starter `skill.yml` and `SKILL.md`, opens the editor, and validates the package before it can be saved as a public profile skill.

## Publishing

Users can publish skills to their own profile as public, private, or unlisted.

Global registry publishing requires collaborator approval. A globally published skill remains attributed to its author but becomes visible in the main registry.
