export const SITE = {
  name: "Tixly",
  tagline: "Screenshot to ticket, instantly.",
  description: "Turn screenshots into structured tickets in seconds.",
};

export const NAV = {
  links: [
    { label: "How it works", href: "#how" },
    { label: "Generate ticket", href: "/dashboard/generate" },
    { label: "Pricing", href: "#pricing" },
  ],
};

export const HERO = {
  badge: "Free: 30 tickets/mo  •  Pro: unlimited  •  BYOK",
  title: "Turn any screenshot into",
  titleHighlight: "actionable tickets.",
  description:
    "Paste a screenshot, get a structured ticket ready for Slack or Linear. Bring your own AI key — your data stays yours. Save 15–30 minutes per issue.",
  cta: "Generate ticket",
  secondaryCta: "Learn how",
  integrationsLabel: "Works with your existing tools",
  integrations: ["Slack", "Linear"],
};

export const HOW_IT_WORKS = {
  title: "Three steps.",
  subtitle:
    "Visual → Structured ticket in 5 seconds. Built for real workflows.",
  steps: [
    {
      step: "01",
      title: "Paste screenshot",
      description:
        "Drop a screenshot or paste from clipboard. Works with bugs, UI issues, client feedback, or any visual context.",
    },
    {
      step: "02",
      title: "AI extracts data",
      description:
        "Our AI analyzes the image and generates a complete, structured ticket with title, description, and context.",
    },
    {
      step: "03",
      title: "Export or copy",
      description:
        "Copy the formatted ticket or export directly to  Linear, Slack.",
    },
  ],
  bottomLink: "Generate your first ticket",
};

export const FEATURES = {
  title: "Visual context, structured output.",
  subtitle:
    "From screenshot to actionable ticket in 5 seconds. No retyping, no formatting hassle.",
  items: [
    {
      title: "Screenshot to ticket",
      description:
        "Transform any screenshot into a complete, structured ticket with title, description, and context — in seconds.",
    },
    {
      title: "Your own AI key",
      description:
        "Bring your own OpenAI, OpenRouter, or Anthropic key. Encrypted at rest, never exposed. Your data stays yours.",
    },
    {
      title: "Export to Slack & Linear",
      description:
        "Send tickets directly to Slack DMs or create Linear issues with one click. More integrations coming.",
    },
    {
      title: "30 free tickets per month",
      description:
        "Start for free with 30 tickets per month. Upgrade to Pro for unlimited generation at $5/month.",
    },
  ],
};

export const USE_CASES = {
  title: "Built for real teams.",
  subtitle: "WHO IT'S FOR",
  items: [
    {
      title: "Developers",
      description:
        "Turn screenshots of errors, UI issues, and unexpected behavior into structured tickets in seconds.",
    },
    {
      title: "QA Testers",
      description:
        "Document bugs, edge cases, and visual inconsistencies with complete context for every issue.",
    },
    {
      title: "Agencies",
      description:
        "Convert client feedback screenshots into actionable tasks. No more retyping or clarifying.",
    },
    {
      title: "Product Teams",
      description:
        "Capture product discussions, design feedback, and visual context into trackable tickets.",
    },
  ],
};

export const PRICING = {
  title: "Simple pricing",
  subtitle: "Free to start, cheap to scale. You bring your own AI key.",
  plans: [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "For individuals trying out Tixly.",
      features: [
        "30 tickets per month",
        "Bring your own AI key",
        "Clipboard copy",
      ],
      cta: "Get started",
      href: "/signup",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$5",
      period: "/month",
      description: "For power users and teams.",
      features: [
        "Unlimited tickets",
        "Bring your own AI key",
        "Slack integration",
        "Linear integration",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      href: "/signup",
      highlighted: true,
    },
  ],
};

export const COMPARISON = {
  title: "Why teams choose Tixly",
  subtitle:
    "Screenshot to structured ticket in seconds — with your own AI key.",
  competitors: [
    {
      name: "SnapBug",
      price: "$$",
      platform: "Web",
      integrations: "GitHub only",
      tixlyAdvantage: "BYOK + Slack, Linear + 30 free tickets/mo",
    },
    {
      name: "BugShot AI",
      price: "$$$",
      platform: "Limited",
      integrations: "Generic",
      tixlyAdvantage: "Your own AI key — privacy first",
    },
    {
      name: "BetterBugs",
      price: "Freemium",
      platform: "Chrome only",
      integrations: "Limited",
      tixlyAdvantage: "Works with any screenshot (web, mobile, desktop)",
    },
    {
      name: "TapperBox",
      price: "$$",
      platform: "Desktop",
      integrations: "Linear, Jira",
      tixlyAdvantage: "Cheaper + web-based + faster onboarding",
    },
  ],
  tixly: {
    price: "$0/mo — $5/mo",
    platform: "Web (all apps)",
    integrations: "Slack, Linear",
    advantage: "Bring your own AI key + 30 free tickets",
  },
  benefits: [
    "5 seconds vs 15–30 minutes per ticket",
    "AI generates title, repro steps, severity",
    "Your own API key — encrypted and private",
    "Works with any screenshot (bugs, UI issues, feedback)",
    "Plug into your existing workflow (no switching tools)",
    "Free tier: 30 tickets/month. Pro: unlimited.",
  ],
  ctaTitle: "Stop rewriting screenshots",
  ctaSubtitle: "Turn any screenshot into a ticket in 5 seconds",
  ctaButton: "Use Tixly",
};

export const CALL_TO_ACTION = {
  badge: "30 free tickets to start",
  title: "Try Tixly for free",
  description:
    "Bring your own AI key, paste a screenshot, and get a structured ticket in seconds. No credit card required.",
  button: "Generate your first ticket",
};

export const FOOTER = {
  links: [
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "Generate ticket", href: "/dashboard/generate" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  builtBy: "Bichitra Behera",
  copyright: "© 2026 TixlyAi. All rights reserved.",
};

export const SOCIALS = [
  {
    platform: "X",
    handle: "X",
    url: "https://x.com/bichitradotdev",
  },
  {
    platform: "LinkedIn",
    handle: "linkedin",
    url: "https://linkedin.com/in/bichitrabehera",
  },
  {
    platform: "GitHub",
    handle: "github",
    url: "https://github.com/bichitrabehera",
  },
];
