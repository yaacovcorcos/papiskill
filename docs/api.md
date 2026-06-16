# API

The public API is used by the CLI and by simple integrations.

Base URL:

```text
https://papiskill.com
```

## Health

```http
GET /api/v1/health
```

## Search skills

```http
GET /api/v1/skills?q=review
```

Returns public global skills and public profile skills.

The list response returns summary metadata, not full package file bodies. Use the detail endpoint before installing or downloading a skill package.

## Get skill

```http
GET /api/v1/skills/official/code-review
GET /api/v1/skills/{handle}/{slug}
```

Private profile skills require:

```http
Authorization: Bearer psk_...
```

Public official/community responses use short shared caching:

```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

Authenticated or owner-scoped private reads are not shared-cacheable.

## Current token user

```http
GET /api/v1/me
Authorization: Bearer psk_...
```
