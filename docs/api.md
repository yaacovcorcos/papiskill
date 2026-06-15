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

## Get skill

```http
GET /api/v1/skills/official/code-review
GET /api/v1/skills/{handle}/{slug}
```

Private profile skills require:

```http
Authorization: Bearer psk_...
```

## Current token user

```http
GET /api/v1/me
Authorization: Bearer psk_...
```
