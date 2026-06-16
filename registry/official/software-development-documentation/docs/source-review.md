# Source Review

This skill was designed from strong software documentation and agent-readiness patterns without copying their text.

## Sources Considered

- The local `repo-wiki` skill from P_A: local-first source-backed repository wiki generation, privacy exclusions, metadata, incremental updates, and verification.
- Factory AutoWiki: structured repository wikis covering architecture, modules, APIs, and conventions; freshness/versioning; optional sync; and current-branch awareness.
- Factory Agent Readiness: documentation is part of making repositories usable by autonomous agents, especially when paired with fast feedback, clear setup, testing, observability, and security practices.
- Diataxis and the Divio documentation system: separate learning, task, reference, and explanation needs.
- GitHub documentation-writer skill: clarity, accuracy, user-centricity, consistency, audience, goal, and scope.
- Hermes llm-wiki: persistent Markdown knowledge base, orientation before edits, index/log discipline, source provenance, contradiction handling, and linting.
- OpenAPI Specification: API descriptions should be language-agnostic, machine-readable where possible, and explicit enough for humans and tools.

## Design Decisions

- This is not just a repo-wiki generator. It covers developer onboarding, architecture, testing, debugging, configuration, data models, API surfaces, deployment, security, and operations.
- It remains local-first and does not assume Factory, Codex, Claude Code, Cursor, GitHub Wiki, or a specific docs platform.
- It keeps API documentation as a conditional section because a dedicated API documentation skill should later go deeper.
- It tells the agent to use judgment and skip unsupported sections instead of generating hollow pages.
- It treats commands as verified only when actually run.

## Rejected Ideas

- Requiring every repo to use one fixed tree.
- Generating full API references from source guesses.
- Publishing or syncing docs automatically.
- Long mandatory page templates that make agents less intelligent.
- Treating docs as finished when no verification ran.
