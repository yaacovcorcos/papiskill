# CLI

The `papiskill` CLI is the terminal interface for the registry.

## Install

During development:

```bash
npm --workspace papiskill run dev -- search review
```

After publish:

```bash
npx papiskill search review
```

## Public commands

```bash
papiskill search code-review
papiskill info official/code-review
papiskill install official/code-review --target codex
papiskill install official/code-review --target claude-code
papiskill install official/code-review --target cursor
papiskill install official/code-review --dir ./skills/code-review
papiskill download official/code-review
papiskill validate ./my-skill
```

## Private commands

Create an API token from the web dashboard, then:

```bash
papiskill login psk_...
papiskill whoami
papiskill install your-handle/private-skill
papiskill logout
```

Tokens are hashed at rest by the web app and are only shown once.
