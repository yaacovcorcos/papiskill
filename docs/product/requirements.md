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
- curated, popular, and recent sorting
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
- public star and comment counts

### Engage

Users can see public stars and comments on globally published and public profile skills. Authenticated users can star skills and leave comments.

Required:

- GitHub login for star/comment writes
- public read access for visible comments and counts
- owner-only comment deletion
- curator-only comment hiding for moderation
- server-side comment limits to reduce spam and duplicate accidental posts
- profile and registry lists reflect current engagement counts

### Authenticate

Users sign in with GitHub OAuth.

Required:

- profile is seeded from GitHub handle/avatar/name
- no password login in v1
- API token management for CLI

### Library

Authenticated users can create original skills or copy any visible skill into their personal library.

Required:

- new private draft from scratch
- public/private visibility choice
- original skill attribution
- editable package files
- validation before save
- download/export
- optional public profile publishing
- stable profile-scoped reference such as `handle/skill-slug`

### Edit

Users can edit their own library skills in the browser.

Required:

- metadata form
- slug/reference form
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
- login and install private own library skills
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
