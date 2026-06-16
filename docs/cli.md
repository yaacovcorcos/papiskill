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
papiskill installed
papiskill update official/code-review
papiskill update --all
papiskill download official/code-review
papiskill validate ./my-skill
```

`papiskill info <reference>` prints validation warnings from the registry API so users can review risky shell, network, script, or secret-related content before installing.

Installs are recorded in the local CLI manifest at `~/.config/papiskill/installed.json` by default, or under `$XDG_CONFIG_HOME/papiskill/installed.json` when `XDG_CONFIG_HOME` is set. The manifest stores the registry reference, skill name, install directory, package file list, and install timestamp so users can audit and update local copies.

## Private commands

Create an API token from the web dashboard, then:

```bash
papiskill login psk_...
papiskill whoami
papiskill install your-handle/private-skill
papiskill logout
```

Tokens are hashed at rest by the web app and are only shown once.
