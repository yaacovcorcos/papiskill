# Deployment access

## Current verified access

As of initial setup:

- Vercel CLI authenticated as `yaacovcorcos`.
- Personal Vercel team visible as `Yaacov's projects` with id `yaacovs-projects-a4ee3dc9`.
- Vercel project `papiskill` is linked and connected to `https://github.com/yaacovcorcos/papiskill`.
- Wrangler authenticated to Cloudflare account `Coryacos1@gmail.com's Account`.
- Cloudflare zone `papiskill.com` is active with zone id `982eac00a9643a13f8c4509cce436914`.
- Cloudflare token includes DNS read/edit for this zone.

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

Completed:

- `papiskill.com` added to Vercel project `papiskill`.
- `www.papiskill.com` added to Vercel project `papiskill`.
- The app redirects `https://www.papiskill.com/*` to the canonical
  `https://papiskill.com/*` origin.
- Cloudflare DNS records created in DNS-only mode:
  - `A papiskill.com 76.76.21.21`
  - `A www.papiskill.com 76.76.21.21`

Verification commands:

```bash
curl -I https://papiskill.com
curl -I https://www.papiskill.com
curl -sS https://papiskill.com/api/v1/health
curl -sS 'https://papiskill.com/api/v1/skills?q=review'
vercel domains inspect papiskill.com --scope yaacovs-projects-a4ee3dc9
vercel domains inspect www.papiskill.com --scope yaacovs-projects-a4ee3dc9
```

Known state from initial deploy:

- `papiskill.com` is live and aliased to the production deployment.
- `www.papiskill.com` DNS is present and should redirect to `papiskill.com`.
