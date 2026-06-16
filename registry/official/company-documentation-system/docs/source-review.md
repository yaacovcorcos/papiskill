# Source Review

This skill was designed from several high-quality documentation patterns without copying their text.

## Sources Considered

- GitLab Handbook: company handbook as the central place for how the company operates, with contribution through merge requests and issues.
- Atlassian internal documentation guidance: make docs easy to follow, accessible, detailed enough, open to contributions, and living rather than static.
- Atlassian documentation standards: create shared rules for format, distribution, and where to find information.
- Diataxis and the Divio documentation system: distinguish tutorials, how-to guides, reference, and explanation, but do not force that taxonomy onto every company page.
- Hermes llm-wiki: persistent Markdown knowledge base, orientation before edits, index/log discipline, provenance, contradiction handling, and linting.

## Design Decisions

- The skill separates company documentation from software documentation because company docs center on operating knowledge, ownership, policy boundaries, onboarding, and repeatable processes.
- It does not require a specific tool such as Confluence, Notion, GitHub, or a local Markdown repo.
- It asks only for decisions that affect structure, audience, privacy, or publishing target.
- It uses templates as defaults, not laws.
- It treats HR, legal, finance, security, benefits, and compliance pages as drafts requiring owner review.

## Rejected Ideas

- A giant mandatory handbook tree for every company.
- Requiring the agent to ask for approval before every page.
- Treating internal docs like API docs.
- Encouraging public-by-default publishing. Visibility must match the content.
