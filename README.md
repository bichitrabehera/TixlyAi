# Tixly

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=1e1e2e&color=blue">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=f0f0f0&color=blue">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs&labelColor=1e1e2e&color=white">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs&labelColor=f0f0f0&color=black">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&labelColor=1e1e2e&color=3178C6">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&labelColor=f0f0f0&color=3178C6">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/AI-BYOK-412991?style=flat-square&labelColor=1e1e2e&color=412991">
    <img alt="BYOK" src="https://img.shields.io/badge/AI-BYOK-412991?style=flat-square&labelColor=f0f0f0&color=412991">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&labelColor=1e1e2e&color=4169E1">
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&labelColor=f0f0f0&color=4169E1">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square&labelColor=1e1e2e&color=brightgreen">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square&labelColor=f0f0f0&color=brightgreen">
  </picture>
</p>

<p align="center">
  <strong>Turn any screenshot into a structured, actionable ticket in seconds.</strong><br>
  Bring your own AI key (OpenAI, OpenRouter, or Anthropic). Free: 30 tickets/month. Pro: unlimited.
</p>

<p align="center">
  🏆 Save 15–30 minutes per issue · ⚡ 5 seconds per ticket · 🔗 Slack & Linear · 🎯 BYOK
</p>

---

## What is Tixly?

Tixly turns screenshots into structured tickets — title, description, priority, reproduction steps, and more. You bring your own AI API key, so your data stays yours and you use the provider you already trust.

Every ticket includes:
- **Title** — Clear, descriptive summary
- **Description** — Full explanation of the issue
- **Priority** — Auto-detected (Critical, High, Medium, Low)
- **Reproduction Steps** — Numbered step-by-step walkthrough
- **Expected vs Actual** — Side-by-side comparison
- **Environment** — Browser, OS, or contextual details

---

## Pricing

| | Free | Pro |
|---|---|---|
| Monthly tickets | 30 | Unlimited |
| AI provider | BYOK (OpenAI / OpenRouter / Anthropic) | BYOK (OpenAI / OpenRouter / Anthropic) |
| Slack integration | ✅ | ✅ |
| Linear integration | ✅ | ✅ |
| Price | $0 | $5/month (₹449) |

Your AI key is encrypted at rest using AES-256-GCM and never exposed to the client.

---

## How It Works

**1. Paste a screenshot** — Drag & drop, click to browse, or paste from clipboard (Ctrl+V / Cmd+V). Works with PNG, JPG, and WebP.

**2. Add context (optional)** — Describe what happened or where you saw the issue. The AI uses this for a more accurate ticket.

**3. AI generates the ticket** — OCR extracts text from the screenshot, then the AI analyzes everything to produce a fully structured ticket.

**4. Send or copy** — Export to Slack, Linear, or copy to clipboard with the screenshot embedded — all in one click.

---

## Integrations

### Slack

Send tickets directly to your Slack DM with one click.

1. Go to **Settings → Integrations → Slack → Connect**
2. Authorize Tixly to send messages to your workspace
3. After generating a ticket, click **Send to Slack**

### Linear

Create issues in your Linear workspace directly from generated tickets.

1. Go to **Linear → Settings → API** and create a **Personal API Key**
2. Paste it in **Settings → Integrations → Linear → Connect**
3. After generating a ticket, click **Send to Linear**

### Clipboard

Every ticket is automatically copied to your clipboard along with the uploaded screenshot as a single clipboard item (image + text). Click **Copy** to recopy anytime.

---

## Settings

Five tabs in the settings page:

| Tab | What you can do |
|---|---|
| **AI Provider** | Add/remove your OpenAI, OpenRouter, or Anthropic API key. Auto-detected from key prefix. |
| **Integrations** | Connect Slack and Linear accounts. |
| **Plan & Billing** | View your plan, upgrade to Pro via Razorpay, or cancel subscription. |
| **Notifications** | Toggle email notification summaries. |
| **Account** | Delete your data. |

---

## Use Cases

- **Bug Reporting** — Screenshot of an error → structured ticket with reproduction steps.
- **QA Testing** — Document test failures with complete context.
- **Client Feedback** — Convert feedback screenshots into structured tasks.
- **Product Reviews** — Capture design critiques during sprint demos.
- **On-call Incidents** — Paste screenshots during incident response.

---

## Tech Stack

| Layer | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Authentication | Clerk |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| AI Providers | OpenAI, OpenRouter, Anthropic (BYOK) |
| OCR | Tesseract.js |
| Slack | OAuth v2 + Web API |
| Linear | GraphQL API |
| Billing | Razorpay |
| Encryption | AES-256-GCM |
| Styling | Tailwind CSS |

---

## Self-Hosting

### Prerequisites

- Node.js 18+
- Clerk account (free tier)
- PostgreSQL database (Neon free tier works)
- An API key from OpenAI, OpenRouter, or Anthropic

### Quick Start

```bash
git clone https://github.com/your-org/tixly-ai
cd tixly-ai
npm install
```

Set up your environment variables (see `.env.example` for all options):

```env
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=<openssl rand -hex 32>

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Run database migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Start the dev server:

```bash
npm run dev
```

### Slack Integration

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `chat:write`, `im:write`, `im:read`, `users:read`
3. Set redirect URL to `https://your-domain.com/api/slack/callback`
4. Add to `.env`:
   ```env
   NEXT_PUBLIC_SLACK_CLIENT_ID=...
   SLACK_CLIENT_ID=...
   SLACK_CLIENT_SECRET=...
   ```

### Razorpay Billing (Optional)

To enable Pro subscriptions:

1. Create a Razorpay account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Generate API keys in **Settings → API Keys**
3. Create a monthly subscription plan in **Plans → Create Plan**
4. Set up a webhook pointing to `https://your-domain.com/api/billing/webhook` for `subscription.charged` and `subscription.cancelled`
5. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_PRO_PLAN_ID=plan_xxxxx
   RAZORPAY_WEBHOOK_SECRET=...
   ```

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

**Stop rewriting. Start generating.**
