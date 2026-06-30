---
name: hermes-tweet
description: Use Hermes Tweet when a Hermes Agent runtime has the hermes-tweet plugin installed and needs X/Twitter search, monitoring, publishing previews, media workflows, giveaway audits, or approval-gated social actions.
---

# Hermes Tweet

Use this skill when the user wants Hermes Agent to inspect or automate X/Twitter through the Hermes Tweet plugin.

Hermes Tweet is a Hermes Agent plugin for Xquik-backed X/Twitter workflows. It exposes three tool families:

- `tweet_explore` for route and capability discovery.
- `tweet_read` for authenticated read-only X/Twitter requests.
- `tweet_action` for writes, private reads, monitors, webhooks, extraction jobs, media workflows, and giveaway draws after explicit approval.

## Prerequisites

- Hermes Agent must have the `hermes-tweet` plugin installed and enabled.
- `XQUIK_API_KEY` must be configured in the Hermes runtime environment for authenticated reads.
- `HERMES_TWEET_ENABLE_ACTIONS=true` is required before action-capable tools appear.
- Project-local Hermes plugin copies require `HERMES_ENABLE_PROJECT_PLUGINS=true` in trusted repositories.

Never ask for, echo, store, or paste secret values. Ask only for environment configuration.

## Workflow

1. Start with `tweet_explore` to find the catalog-listed endpoint or capability.
2. Use `tweet_read` only for known read-only endpoints.
3. Use `tweet_action` only when the user has approved the exact endpoint, method, payload, and expected side effect.

If the Hermes Tweet tools are unavailable, give installation or configuration guidance instead of inventing HTTP fallbacks.

## Decision Rules

- If the user asks for X/Twitter search, trend checks, account research, social listening, launch monitoring, support triage, creator research, brand research, or giveaway audits, use `tweet_explore` first.
- If the selected endpoint is read-only, use `tweet_read`.
- If the selected endpoint writes data, touches private account state, creates jobs, modifies monitors, sends DMs, posts, deletes, follows, likes, reposts, uploads media, or changes webhooks, use `tweet_action` only after approval.
- If actions are disabled, explain that Hermes Tweet intentionally gates action tools behind `HERMES_TWEET_ENABLE_ACTIONS=true`.
- If `XQUIK_API_KEY` is missing, ask the user to configure it in the runtime environment without sending the key in chat.
- If Hermes reports the plugin is installed but not enabled, ask the user to run `hermes plugins enable hermes-tweet`.

## Safety

- Use only catalog-listed `/api/v1/...` paths returned by Hermes Tweet discovery.
- Reject direct URL guessing and direct HTTP fallbacks.
- Do not use account connection, re-authentication, API-key management, billing, credit top-up, or support-ticket endpoints.
- Summarize side effects before posting, deleting, following, sending DMs, changing profiles, configuring monitors, creating webhooks, launching extraction jobs, or running draws.
- Keep unattended or scheduled workflows read-only unless the workflow has a clear approval step.

## Examples

Find a read endpoint:

```json
{"query":"tweet search","method":"GET"}
```

Then call `tweet_read` with the catalog-listed path, for example:

```json
{"path":"/api/v1/x/tweets/search","query":{"q":"AI agents","limit":25}}
```

Prepare a write:

```json
{"query":"post tweet","include_actions":true}
```

Then call `tweet_action` only after approval:

```json
{"path":"/api/v1/x/tweets","method":"POST","body":{"account":"@example","text":"Hello from Hermes Tweet"},"reason":"Post the user-approved tweet."}
```

## Verification

After installation or upgrade:

1. Run `hermes plugins enable hermes-tweet` unless the install used `--enable`.
2. Run `hermes plugins list` and confirm the plugin is enabled.
3. Run `hermes tools list` and confirm the Hermes Tweet toolset is present.
4. Confirm `tweet_explore` is available without `XQUIK_API_KEY`.
5. Confirm `tweet_read` appears only when `XQUIK_API_KEY` is configured.
6. Confirm `tweet_action` stays hidden or disabled unless `HERMES_TWEET_ENABLE_ACTIONS=true`.
