# Release Runbook

## Local Gate

Run from repo root:

```bash
npm install
npm run check
```

## Database

Before production deploy:

```bash
npm run db:generate
npm --workspace @papiskill/web exec prisma migrate status
```

Apply production migrations through the deploy pipeline or a deliberate operator command using production `DIRECT_URL`.

## Vercel

Project: `papiskill`

Domain:

```text
papiskill.com
```

Required env vars:

```bash
DATABASE_URL
DIRECT_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

Deploy:

```bash
vercel --prod
```

## Post-Deploy Smoke

- `/` loads
- `/skills` loads
- `/skills?category=coding&compatibility=codex` renders filtered results on desktop and mobile
- GitHub login starts OAuth
- public API health route responds
- public skill API/detail/download routes return `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- CLI can search public registry against production API
