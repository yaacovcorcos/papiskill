# Contributing

## Ways to contribute

- improve the web app
- improve the CLI
- improve skill validation
- submit new global registry skills
- improve documentation

## Global registry skills

Global skills live under:

```text
registry/official/<skill-id>/
```

Existing global skill detail pages show the exact source path and link to the
GitHub source/editor for `SKILL.md`. Use those links when proposing a focused
change to an already-published skill.

They require:

- valid `skill.yml`
- valid `SKILL.md`
- MIT-compatible license unless explicitly approved
- clear author attribution
- validation without errors
- collaborator approval

Run:

```bash
npm run registry:validate
```

## Development flow

```bash
npm install
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run build
```

Keep changes scoped and update docs when behavior changes.
