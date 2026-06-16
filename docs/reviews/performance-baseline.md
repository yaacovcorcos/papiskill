# Public performance baseline

Date: 2026-06-17

This records the first repeatable public performance smoke for PapiSkill production.

Command:

```bash
npm run perf:public -- --base-url https://papiskill.com
```

Result:

```text
PAGE /skills 200 dcl=2227ms load=2227ms html=134690b resources=43 console=0w/0e
PAGE /skills/official/code-review 200 dcl=2182ms load=2182ms html=64855b resources=15 console=0w/0e
ENDPOINT /api/v1/health 200 bytes=33 cache=public, max-age=0, must-revalidate cdn=public, max-age=30, stale-while-revalidate=60
ENDPOINT /api/v1/skills/official/code-review 200 bytes=4656 cache=public, max-age=0, must-revalidate cdn=public, max-age=60, stale-while-revalidate=300
ENDPOINT /download/official/code-review?format=zip 200 bytes=2376 cache=public, max-age=0, must-revalidate cdn=public, max-age=60, stale-while-revalidate=300
```

Interpretation:

- Public registry and official detail pages load successfully with no browser console warnings or errors.
- Dynamic HTML pages are intentionally not shared-cacheable.
- Public API, health, and public download endpoints expose shared CDN cache headers.
- The smoke script uses intentionally loose budgets to catch clear regressions without making normal network variance a release blocker.
