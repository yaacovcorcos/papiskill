# PapiSkill

PapiSkill is a professional open-source registry for portable `SKILL.md` packages.

It provides:

- a fast public web registry at `papiskill.com`
- official and community skill collections backed by Git
- GitHub-authenticated profiles
- public or private personal forks
- an in-browser skill editor
- a flexible CLI for search, install, download, validation, and authenticated private installs
- production documentation, tests, and release runbooks

## Repository Layout

| Path | Purpose |
|---|---|
| `apps/web` | Next.js App Router web app deployed on Vercel |
| `packages/cli` | `papiskill` CLI package |
| `packages/skill-core` | shared skill package schema, parser, validation, and install target logic |
| `registry/official` | official reviewed skill packages |
| `registry/community` | optional Git-reviewed community skill packages |
| `docs` | architecture, plans, runbooks, security, and contributor documentation |
| `scripts` | repository automation and release gates |

## Canonical Commands

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

Web development:

```bash
npm run dev
```

CLI development:

```bash
npm --workspace @papiskill/cli run dev -- search review
```

## Documentation Entry Points

- [Agent Constitution](./AGENTS.md)
- [Product Requirements](./docs/product/requirements.md)
- [Architecture Overview](./docs/architecture/overview.md)
- [Skill Package Specification](./docs/architecture/skill-package-spec.md)
- [Database Architecture](./docs/runbooks/db-architecture.md)
- [Security Baseline](./docs/runbooks/security-baseline.md)
- [Release Runbook](./docs/runbooks/release.md)
- [Active Plans](./docs/plans/README.md)

## License

MIT.
