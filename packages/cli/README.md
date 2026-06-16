# PapiSkill CLI

Install, inspect, validate, and update portable `SKILL.md` packages from the terminal.

```bash
npx papiskill search review
npx papiskill info official/code-review
npx papiskill install official/code-review --target codex
```

The CLI talks to `https://papiskill.com` by default. Use `--api-url` for a local or staging registry.

Private profile skills require an API token created in the PapiSkill dashboard:

```bash
npx papiskill login psk_...
npx papiskill whoami
npx papiskill install your-handle/private-skill
```

See the full docs at https://papiskill.com/docs/cli.
