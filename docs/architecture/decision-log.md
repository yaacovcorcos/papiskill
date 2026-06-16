# Architecture Decision Log

## 2026-06-16 - Use Postgres/Supabase Instead Of Convex

Decision: PapiSkill uses Supabase Postgres with Prisma rather than Convex.

Why: The domain is CRUD-heavy, relational, Git-backed, and benefits from SQL, migrations, portability, and familiar operations. Convex is excellent for reactive apps, but PapiSkill's core needs are registry indexing, ownership, search, forks, tokens, and auditable contribution flow.

Constraints: Realtime collaboration is not a v1 requirement. If collaborative editing becomes central later, add a focused realtime layer instead of replacing the data foundation.

## 2026-06-16 - Use Better Auth With GitHub OAuth

Decision: Better Auth is the identity authority and GitHub OAuth is the primary provider.

Why: GitHub identity fits a Git/PR-based registry, avoids passwords in v1, and matches the user's successful LitRev architecture pattern. Supabase Auth is intentionally not used.

Constraints: GitHub private email behavior must be handled. CLI private access uses app-owned hashed API tokens.

## 2026-06-16 - Skill Packages Are Folders

Decision: A skill package is a folder containing `skill.yml` and `SKILL.md`.

Why: Folder packages allow metadata, examples, scripts, docs, and assets without overloading frontmatter. This works better for validation, CLI installation, review, and future compatibility.

Constraints: Single-file export remains supported for simple skills, but canonical package identity is directory-based.

## 2026-06-16 - Global Registry Skills Are Curator-Published

Decision: Globally visible curated skills live in `registry/official` and are published by an authorized collaborator, regardless of original author.

Why: The user wants any author's skill to become globally discoverable without forcing users to browse profile pages. "Official" in product language means curator-published global visibility, not sole authorship by the maintainer.

Constraints: User profile skills may be public immediately but are not globally curated until approved/published.

## 2026-06-16 - User Libraries Use SkillFork Rows

Decision: A user's editable library is represented by `SkillFork` rows owned by that user, with files in `SkillForkFile`, validation notes in `SkillForkValidation`, and source lineage stored on the row.

Why: Library items are profile-owned copies of a visible source skill. They need stable `handle/slug` references, public/private/unlisted visibility, validation, downloads, and source attribution. A separate `Library` table would duplicate ownership and visibility without adding a distinct domain.

Constraints: Public profile pages list only `PUBLIC` library skills. `UNLISTED` library skills are reachable by direct reference when permitted. `PRIVATE` library skills require owner session or owner API token. Archived library rows remain in Postgres but are excluded from public and dashboard active lists.
