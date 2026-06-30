# Setup Guide

- [Getting an AI Provider Key](#getting-an-ai-provider-key)
  - [OpenAI](#openai)
  - [OpenRouter](#openrouter)
  - [Anthropic (Claude)](#anthropic-claude)
- [Connecting Integrations](#connecting-integrations)
  - [Slack](#slack)
  - [Linear](#linear)

---

## Getting an AI Provider Key

Tixly lets you bring your own API key from OpenAI, OpenRouter, or Anthropic. Your key is encrypted and stored securely — it is never exposed to the client or shared.

### OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Give it a name (e.g. "Tixly")
4. Copy the key — it starts with `sk-proj-` or `sk-`
5. In Tixly, go to **Settings → AI Provider**, paste the key, and click **Save**

### OpenRouter

OpenRouter gives you access to many models (including OpenAI, Anthropic, Google, Meta, and more) through a single API. It auto-selects the best model for each request.

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Click **Create Key**
3. Give it a name (e.g. "Tixly")
4. Copy the key — it starts with `sk-or-v1-`
5. In Tixly, go to **Settings → AI Provider**, paste the key, and click **Save**

**Why use OpenRouter?**
- Access to many models through one key
- Auto-select picks the best model for ticket generation
- One billing dashboard across providers

### Anthropic (Claude)

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **Create Key**
3. Give it a name (e.g. "Tixly")
4. Copy the key — it starts with `sk-ant-`
5. In Tixly, go to **Settings → AI Provider**, paste the key, and click **Save**

> Your key is tested automatically before saving. If the test fails, double-check the key is active and has credits available.

---

## Connecting Integrations

### Slack

Send generated tickets directly to your Slack DMs.

1. Go to **Settings → Integrations** in Tixly
2. Click **Connect** next to Slack
3. You will be redirected to Slack's authorization page
4. Choose the workspace and approve the permissions
5. You will be redirected back to Tixly — Slack is now connected
6. When you generate a ticket, use the Slack button to send it to your DM

**To disconnect:** Go to **Settings → Integrations** and click **Disconnect** next to Slack.

#### Setting up Slack (for self-hosters)

If you are self-hosting Tixly, you need to create a Slack app:

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App → From scratch**
3. Name it "Tixly" and choose your workspace
4. Go to **OAuth & Permissions**
5. Under **Redirect URLs**, add `https://your-domain.com/api/slack/callback` (or `http://localhost:3000/api/slack/callback` for local dev)
6. Under **Scopes**, add these Bot Token Scopes:
   - `chat:write`
   - `im:write`
   - `im:read`
   - `users:read`
7. Install the app to your workspace
8. Copy the **Client ID** and **Client Secret**
9. Set these environment variables:
   ```
   SLACK_CLIENT_ID=
   SLACK_CLIENT_SECRET=
   NEXT_PUBLIC_SLACK_CLIENT_ID=
   ```

### Linear

Create Linear issues directly from generated tickets.

1. Go to [linear.app/settings/api](https://linear.app/settings/api)
2. Under **Personal API Keys**, click **Create key**
3. Give it a name (e.g. "Tixly")
4. Copy the key — it starts with `lin_api_`
5. In Tixly, go to **Settings → Integrations**, paste the key under Linear, and click **Connect**
6. When you generate a ticket, use the Linear button to create an issue

**To disconnect:** Go to **Settings → Integrations** and click **Disconnect** next to Linear.

---

## Plans & Billing

| Plan | Price | Tickets |
|------|-------|---------|
| Free | $0 | 10 / month |
| Pro  | $5/month (₹449) | Unlimited |

To upgrade, go to **Settings → Plan & Billing** and click **Upgrade to Pro**. Payment is processed through Razorpay.
