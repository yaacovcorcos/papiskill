---
name: company-documentation-system
description: Build and maintain clear company handbooks, knowledge bases, process docs, decision records, and onboarding docs. Use when creating, improving, auditing, or organizing internal company documentation, team operating knowledge, policies, or company wiki systems.
---

# Company Documentation System

Use this skill when the user wants to create, improve, audit, or maintain internal company documentation: a company handbook, team knowledge base, operating manual, onboarding guide, process library, policy hub, decision log, or cross-team source of truth.

This skill is for company and team knowledge. For codebase architecture, setup, deployment, testing, or API documentation, prefer a software documentation skill.

## Core Judgment

Make documentation useful before making it complete.

Do not try to document everything. Build the smallest system that lets people answer real work questions faster, update the right page when something changes, and trust what they find.

Ask questions only when the missing answer changes the structure, audience, privacy boundary, or publishing target. Otherwise, make a reasonable first pass and call out assumptions.

## What Good Looks Like

A good company documentation system is:

- easy to search and browse
- owned by clear teams or people
- current enough to be trusted
- explicit about what is public, internal, confidential, or restricted
- written in plain language
- organized around how people actually work
- easy for teammates to update
- honest about gaps, drafts, and uncertain information

## First Pass

Before writing or changing docs, quickly identify:

- audience: employees, leadership, candidates, contractors, customers, partners, or a specific team
- scope: company-wide handbook, one team, one workflow, onboarding, policy, or cleanup
- destination: Markdown repo, wiki, Notion, Confluence, Google Docs, GitHub, or another tool
- visibility: public, internal, confidential, restricted, or mixed
- source material: existing docs, tickets, meeting notes, repo files, policies, chat summaries, or user-provided notes
- owner model: named owner, team owner, approver, or "needs owner"
- freshness model: review date, source-of-truth link, change log, or no maintenance expectation

If any of those are unknown but not blocking, proceed with placeholders such as `Owner: TBD` or `Review cadence: TBD`.

## Information Architecture

Prefer this top-level shape unless the existing system already has a better one:

```text
company-docs/
|-- index.md
|-- docs-system.md
|-- handbook/
|   |-- index.md
|   |-- mission-and-principles.md
|   |-- ways-of-working.md
|   `-- communication.md
|-- teams/
|   |-- index.md
|   `-- <team>.md
|-- processes/
|   |-- index.md
|   `-- <process>.md
|-- onboarding/
|   |-- index.md
|   `-- <role-or-team>.md
|-- decisions/
|   |-- index.md
|   `-- YYYY-MM-DD-short-title.md
|-- policies/
|   |-- index.md
|   `-- <policy>.md
|-- glossary.md
`-- maintenance.md
```

Adapt the structure to the company. Skip sections that do not have real content. Add sections only when they match how the organization works.

## Page Patterns

Use the right pattern for the job.

### Handbook Page

Use for stable company expectations, principles, or operating norms.

Include:

- purpose
- who it applies to
- the current rule or practice
- examples or edge cases
- owner
- last reviewed date
- related pages

### Team Page

Use for a team, function, pod, working group, or department.

Include:

- what the team owns
- who the team serves
- key responsibilities
- decision rights
- recurring rituals
- current systems or tools
- how to request help
- owner or maintainer
- related teams and pages

### Process Page

Use for repeatable work someone needs to do correctly.

Include:

- when to use the process
- when not to use it
- prerequisites
- roles and responsibilities
- steps
- expected output
- common failures
- escalation path
- owner
- review cadence

### Onboarding Page

Use for a role, team, location, or company-wide onboarding path.

Include:

- first-day essentials
- first-week goals
- first-month goals
- accounts and access needed, by name only
- people to meet
- documents to read
- first useful tasks
- success signals
- who to ask for help

### Decision Record

Use for decisions that people will need to understand later.

Include:

- date
- status: proposed, accepted, superseded, or retired
- decision
- context
- options considered
- consequences
- owner
- links to related work

## Source Handling

Treat company documentation as a trust surface.

- Prefer existing source-of-truth material over memory or guesses.
- If source material conflicts, preserve the conflict and ask for resolution instead of silently choosing one.
- Do not include private personal details, compensation details, medical details, legal claims, customer secrets, credentials, or sensitive HR information unless the user explicitly asks and the destination is appropriate.
- For policies, compliance, legal, finance, security, HR, or benefits docs, mark drafts as needing review by the appropriate owner.
- Use source links or citations when the destination supports them.
- When converting informal notes into docs, separate facts, decisions, open questions, and opinions.

## Maintenance Rules

Every durable page should have enough metadata for future readers to trust it:

```markdown
Owner: Team or person
Status: Draft | Active | Needs review | Archived
Last reviewed: YYYY-MM-DD
Next review: YYYY-MM-DD or TBD
Source of truth: Link, file path, or "This page"
```

Do not overdo metadata for throwaway drafts. Use it for pages people will rely on.

## Quality Bar

Before finishing, check:

- the page has a clear audience and purpose
- a reader can tell whether the page is current
- ownership is named or explicitly missing
- the title matches likely search terms
- acronyms and company jargon are explained
- steps are actionable
- related pages are linked
- private or sensitive details were not exposed accidentally
- drafts that require review are labeled
- there is no fake certainty where the source is weak

## Final Response

When reporting back, include:

- what was created or changed
- where the docs live
- key assumptions
- owners or reviewers still needed
- sensitive areas deliberately avoided
- the next highest-leverage documentation gap
