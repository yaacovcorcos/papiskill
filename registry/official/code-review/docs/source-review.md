# Source Review

This skill was rebuilt as a code-change review skill rather than a broad codebase audit.

## Sources Considered

- Factory Local Code Review: local review supports base-branch reviews, uncommitted changes, commit reviews, custom review instructions, P0-P3 severities, and concise actionable findings.
- Factory Droid Action: automated PR review and security review are separate workflows; security review can run alongside normal review and uses a specialized threat model.
- Google Code Review Standard: approve changes that improve overall code health even if imperfect; do not block on minor polish; technical facts and data override preference.
- Google What to Look For: review design, functionality, complexity, tests, naming, comments, style, consistency, and documentation.
- Software Engineering at Google: code review is a pre-commit consent and reflection point, and code itself is a long-term maintenance liability.
- GitHub guidance on agent-generated PRs: agent PRs can look complete while hiding CI weakening, duplicated code, missing context, and quiet technical debt.
- Local P_A `local-code-review` skill: preserve dirty worktree ownership, review coherent local batches, report verification, and do not stage/commit/push unless asked.

## Design Decisions

- Keep one primary `code-review` skill for reviewing a changed code surface: PR, base branch diff, commit, patch, or local dirty worktree.
- Treat PR/local/commit as review modes, not separate skills.
- Include agent-generated change review as a mode inside this skill for now because the output shape and finding bar are the same.
- Keep whole-repository quality audits, full security scans, performance reviews, and release readiness reviews as separate future skills.
- Prefer a strong finding bar over a large mechanical checklist. The checklist is there to guide judgment, not replace it.
- Require findings-first output so real risks are not hidden below summaries.

## Important Boundaries

- The skill does not ask the agent to make code changes.
- The skill does not run or install tools by default; it reports whatever verification was actually performed.
- It gates staging, committing, pushing, discarding, or rewriting local work behind explicit user request.
- It asks reviewers not to demand perfect code when the change improves the system and remaining points are optional.

## Review Result

The final skill is intentionally stricter than the previous official version on finding quality, agent-generated PR hazards, security/privacy triggers, tests, and local workspace boundaries. It remains broad enough for intelligent agents to use judgment instead of filling a form.
