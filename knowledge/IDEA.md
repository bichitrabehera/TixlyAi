# The Idea

## What Tixly is

A screenshot → structured ticket machine. You drag in a screenshot (or paste OCR text), optionally add a sentence of context, and Tixly returns a complete, formatted ticket: title, description, priority, reproduction steps, expected vs. actual, environment.

## Who it's for

Developers, QA engineers, PMs, and on-call folks who are tired of writing tickets by hand. The moment someone screenshots a bug and starts retyping it into Linear/Jira is the moment Tixly should be open in another tab.

## The pitch

- **~5 seconds** per ticket, not 15–30 minutes.
- **BYOK** — bring your own OpenAI, OpenRouter, or Anthropic key. No markup, no subscription, no "credits." Your key, your data, your provider.
- **One-click out** — copy to clipboard (ticket + screenshot as one clipboard item), send to Slack DM, or create a Linear issue.

## What "good" looks like

A generated ticket should be something a human would have written on a good day — specific reproduction steps, an honest severity, and no invented details. When the model isn't confident, it must say so (`needsHumanReview`) rather than hallucinate a clean-sounding ticket.

## Business model

Free. There is no paid tier today. The product is the funnel: a genuinely useful free tool for a specific job, with BYOK keeping our costs (and liability) near zero.

## Non-goals (for now)

- Multi-tenant team workspaces / orgs
- Billing or plans
- Self-hosted AI
- Ticket import (Jira → Tixly). Export only.
