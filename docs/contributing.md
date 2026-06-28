# Contributing

Start with [`docs/onboarding.md`](./onboarding.md). It is written for
contributors working with coding agents and explains the lightest setup for
skills, docs, CLI work, web app work, or full-project collaboration.

## Ways to contribute

### Product and experience

- improve the user experience across discovery, skill detail pages, downloads,
  editing, profiles, and dashboard flows
- improve the contribution flow for skill authors and open-source collaborators
- improve skill search, filters, categories, tags, and result ranking
- improve the community skill experience and make community submissions easier
  to review, trust, and install

### Skills and ecosystem

- analyze published skills for quality, clarity, portability, and real-world
  effectiveness
- submit new global registry skills
- improve shared skill validation
- explore a broader plugin model beyond individual skills
- plan support for organizations, groups, or communities with shared skill
  spaces that are visible to members but not public

### Security and reliability

- diagnose, plan, and improve site security
- build automated review for external skill security, safety, and package
  hygiene
- improve site speed and public route performance
- find bugs, write regression tests, and fix them

### Project maintenance

- improve the CLI
- improve documentation and runbooks

When in doubt, open a small scoped PR first. A focused improvement that is easy
to review is better than a broad mixed change.

## Global registry skills

Global skills live under:

```text
registry/official/<skill-id>/
```

Existing global skill detail pages show the exact source path and link to the
GitHub source/editor for `SKILL.md`. Use those links when proposing a focused
change to an already-published skill.

They require:

- valid `skill.yml`
- valid `SKILL.md`
- MIT-compatible license unless explicitly approved
- clear author attribution
- validation without errors
- collaborator approval

Run:

```bash
npm run registry:validate
```

Setup, validation commands, and the rule about committing the regenerated
registry index are in
[`docs/onboarding.md` Path A](./onboarding.md#path-a--author-or-edit-a-skill).
Do not skip the generated registry step; stale generated registry output breaks
CI.

## Pull requests and review

- Set up and run the project with the
  [`docs/onboarding.md`](./onboarding.md) path that matches your work.
- Before opening a PR, meet the
  [Definition of done](./onboarding.md#definition-of-done). `npm run check` is
  the main local gate; CI also checks dependency audit, registry freshness, and
  CLI package dry-runs.
- Use conventional commit messages, keep each PR scoped to one coherent change,
  and target `main`.
- Update docs in the same PR when behavior changes.
- Changes to authentication, ownership, privacy, API tokens, or the official
  registry require collaborator approval.
- Draft PRs are welcome when you want direction before polishing the change.
- Never commit `.env.local`, secrets, API tokens, credentialed database URLs, or
  private user data.
