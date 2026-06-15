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

## Publishing

Users can publish skills to their own profile as public, private, or unlisted.

Global registry publishing requires collaborator approval. A globally published skill remains attributed to its author but becomes visible in the main registry.
