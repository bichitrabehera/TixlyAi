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
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&labelColor=1e1e2e&color=412991">
    <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&labelColor=f0f0f0&color=412991">
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
  Works with any bug, error, or UI issue. Generates tickets instantly — title, description, priority, reproduction steps, and more.
</p>

<p align="center">
  🌐 <strong>Generate a Ticket</strong> • 📖 <strong>Read the Docs</strong> • 🐙 <strong>View on GitHub</strong>
</p>

<p align="center">
  🏆 Save 15–30 minutes per issue · ⚡ 5 seconds per ticket · 🔗 Send to Slack & Linear · 🎯 AI-powered priority detection
</p>

<p align="center">
  <em>Loved by developers, QA teams, and product managers who are tired of rewriting bug reports.</em>
</p>

---

## What is this?

Tixly eliminates the manual work of bug reporting. Paste a screenshot, and our AI instantly generates a complete, structured ticket ready for your project management tool. No typing. No formatting. Just results.

Every ticket includes:
- **Title** — Clear, descriptive summary
- **Description** — Full explanation of the issue
- **Priority** — Auto-detected (Critical, High, Medium, Low)
- **Reproduction Steps** — Numbered step-by-step walkthrough
- **Expected vs Actual** — Side-by-side comparison
- **Environment** — Browser, OS, or contextual details

Want to see it in action? Browse the [gallery](#) or [generate your first ticket](#).

---

## How It Works

**Step 1 — Upload a screenshot**

Drag & drop, click to browse, or paste from clipboard (Ctrl+V / Cmd+V). Works with PNG, JPG, and WebP.

**Step 2 — Add context (optional)**

Describe what happened, where you saw the issue, or any additional details. The AI uses this to generate a more accurate ticket.

**Step 3 — AI generates the ticket**

TixlyAI extracts text from the screenshot using OCR, then analyzes everything to produce a fully structured ticket.

**Step 4 — Send or copy**

Export to Slack, Linear, or copy to clipboard with screenshot embedded — all in one click.

---

## Integrations

### Slack

Send tickets directly to your Slack DM with one click.

```
Connect → Authorize → Send
```

#### How to connect

1. Go to **Integrations** → **Slack** → **Connect**
2. Authorize TixlyAI to send messages to your workspace
3. After generating a ticket, click **Send to Slack**

Every user authenticates independently. Your Slack token is stored securely — only your tickets are sent to your Slack.

#### What gets sent

```
🐞 New Bug Report
  • Title: Login button unresponsive on mobile
  • Priority: High
  • Description: The login button does not respond...
  • Steps to Reproduce: 1. Open app on iOS...
  • Expected vs Actual: Button should navigate...
```

### Linear

Create issues in your Linear workspace directly from generated tickets.

#### How to connect

1. Go to **Linear** → Settings → **API**
2. Create a **Personal API Key**
3. Paste it in **Integrations** → **Linear** → **Connect**

#### How sending works

After generating a ticket, click **Send to Linear**. An issue is created with title, description, priority, and labels in your Linear workspace.

### Clipboard

Every generated ticket is automatically copied to your clipboard along with the uploaded screenshot as a single clipboard item (image + text). Click **Copy** to recopy anytime.

---

## Interface

### ChatGPT-Style Layout

- **Output-first** — generated tickets appear prominently in the main area
- **Fixed input bar** — text input and screenshot upload always accessible at the bottom
- **Auto-growing textarea** — expands as you type
- **Session persistence** — your work is saved locally and restored when you come back

### Daily Usage Tracking

Your current usage is shown at the top of the generate page. Free plan includes **10 tickets per day** with a visible counter.

---

## Use Cases

**Bug Reporting** — Screenshot of an error → structured ticket with reproduction steps. Ready to send.

**QA Testing** — Document test failures with complete context. Actionable immediately.

**Client Feedback** — Convert feedback screenshots into structured tasks. No back-and-forth.

**Product Reviews** — Capture design critiques and UI feedback during sprint demos.

**On-call Incidents** — Paste screenshots during incident response. Get tickets while context is fresh.

---

## FAQ

### How accurate is the AI?

Uses OpenAI GPT-4o combined with OCR. Accuracy depends on screenshot quality. For best results, use clear screenshots with readable text.

### What if OCR fails?

A manual text input appears — paste the error message and the AI still generates a complete ticket.

### Is there a daily limit?

Free plan: 10 tickets per day. Usage is shown at the top of the generate page.

### Are my screenshots stored?

Uploaded temporarily for processing. Clear your session anytime with the reset button.

### Can multiple team members connect the same Slack?

Yes. Each user authenticates independently. Tokens are stored separately and scoped per user.

### Is my data encrypted?

Yes. Slack OAuth tokens and Linear API keys are encrypted at rest using AES-256-GCM before storage.

---

## Tech Stack

| Layer | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Authentication | Clerk |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| AI Model | OpenAI GPT-4o |
| OCR | Tesseract.js |
| Slack | OAuth v2 + Web API |
| Linear | GraphQL API |
| Styling | Tailwind CSS |
| Encryption | AES-256-GCM |

---

## Self-Hosting

Deploy your own instance of TixlyAI.

### Prerequisites

- Node.js 18+
- Clerk account (free tier available)
- PostgreSQL database (Neon free tier works)
- OpenAI API key

### Quick Start

```bash
git clone https://github.com/your-org/tixly-ai
cd tixly-ai
npm install
```

Set up your environment variables:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=<openssl rand -hex 32>
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

### Slack Integration (Self-Hosted)

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `chat:write`, `im:write`, `im:read`, `users:read`
3. Set redirect URL to `https://your-domain.com/api/slack/callback`
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SLACK_CLIENT_ID=...
   SLACK_CLIENT_ID=...
   SLACK_CLIENT_SECRET=...
   ```

---

## Sponsors

(Become a sponsor — support open-source development)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Stop rewriting. Start generating.**

[Generate your first ticket →](#)
