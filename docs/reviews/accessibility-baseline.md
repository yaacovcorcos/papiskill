# Public accessibility baseline

Date: 2026-06-17

This records the first repeatable public accessibility smoke for PapiSkill.

Command:

```bash
npm run a11y:public -- --base-url http://localhost:3003
```

Result:

```text
PAGE /skills 200 h1=1 main=1 controls=0 unlabeled console=0w/0e
PAGE /skills/official/code-review 200 h1=1 main=1 controls=0 unlabeled console=0w/0e
PAGE /docs 200 h1=1 main=1 controls=0 unlabeled console=0w/0e
PAGE /docs/authoring 200 h1=1 main=1 controls=0 unlabeled console=0w/0e
```

What the smoke checks:

- public route status codes
- no browser console warnings or errors
- exactly one `main` landmark
- exactly one visible page `h1`
- skip link exists, is first in keyboard focus order, and moves focus to `#main-content`
- no duplicate IDs
- visible links, buttons, inputs, textareas, selects, and summaries have accessible names
- visible images have `alt`

Current scope:

- Public registry, official skill detail, docs index, and authoring docs.
- Authenticated dashboard/editor traversal still needs a signed-in browser pass.
