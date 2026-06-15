# Deployment access

## Current verified access

As of initial setup:

- Vercel CLI authenticated as `yaacovcorcos`.
- Personal Vercel team visible as `Yaacov's projects` with id `yaacovs-projects-a4ee3dc9`.
- Wrangler authenticated to Cloudflare account `Coryacos1@gmail.com's Account`.
- Cloudflare token includes `zone:read`; DNS write capability must be verified when creating records.

## Domain

Domain:

```text
papiskill.com
```

The domain was purchased in Cloudflare.

## If authentication expires

Vercel:

```bash
vercel login
vercel whoami
```

Cloudflare:

```bash
npx wrangler login
npx wrangler whoami
```

## DNS plan

After Vercel project creation:

1. Add `papiskill.com` to the Vercel project.
2. Add `www.papiskill.com` if desired.
3. Use Vercel-provided DNS records.
4. Apply records in Cloudflare DNS.
5. Keep proxy mode aligned with Vercel guidance. If certificate validation is slow, temporarily use DNS-only records.
