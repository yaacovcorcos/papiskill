# PapiSkill Skill Core

Shared schema, parsing, validation, package-file, and install-target helpers for PapiSkill.

Most users should install skills through the CLI:

```bash
npx papiskill install official/code-review
```

Use this package directly when building tooling around the portable PapiSkill package contract:

```ts
import { validateSkillPackage } from "@papiskill/skill-core";
```

See the package format docs at https://papiskill.com/docs/authoring.
