# Product Requirements

## Purpose

PapiSkill helps people discover, customize, install, and contribute portable `SKILL.md` packages for AI agent workflows.

It is a registry and editing layer, not an agent runtime.

## Audience

- agent users who want reusable skills
- skill authors who want a public profile and distribution page
- maintainers curating globally published skills from any author
- teams looking for inspectable skill packages before installing them

## Core Workflows

### Browse

Users can browse globally published and public community/profile skills without logging in.

Required:

- keyword search
- category and agent compatibility filters
- global/community/profile distinction
- clear install and download actions
- trust/safety metadata

### Inspect

Users can open a skill detail page.

Required:

- rendered `SKILL.md`
- raw source
- metadata
- compatibility targets
- validation status
- safety warnings
- source repo or profile attribution
- install commands
- download/export

### Authenticate

Users sign in with GitHub OAuth.

Required:

- profile is seeded from GitHub handle/avatar/name
- no password login in v1
- API token management for CLI

### Fork

Authenticated users can fork any visible skill into their profile.

Required:

- public/private visibility choice
- original skill attribution
- editable package files
- validation before save
- download/export
- optional public profile publishing

### Edit

Users can edit their own skill forks in the browser.

Required:

- metadata form
- `SKILL.md` editor
- preview
- validation and safety warnings
- save
- download
- visibility toggle

### Publish Globally

Users can submit or request a skill to be published into the main global registry.

Required:

- collaborator approval
- original author attribution
- package validation
- visible distinction from profile-only skills
- direct global discovery without opening a user's profile first

### Contribute

Users can propose global registry skill changes through GitHub.

Required:

- exact source path shown
- contribution guide
- link to open/edit on GitHub
- validation rules documented

### CLI

Users can install skills from the terminal.

Required:

- search public registry
- inspect skill
- install global/public skill
- login and install private own forks
- validate local package
- install into Codex, Claude Code, Cursor, generic, or custom target paths

## Non-Goals

- Running skills.
- Executing arbitrary skill scripts from the web app.
- Full social network features.
- Paid marketplace.
- Team/organization permissions in v1.

## Product Tone

Professional, minimalist, fast, clear, and trustworthy.
