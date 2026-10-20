"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { Header } from "@/components/Header";

/* -------------------------------------------------------------------------- */
/*  Links                                                                     */
/* -------------------------------------------------------------------------- */

const AI_SETTINGS = `${ROUTES.generate}?settings=ai`;
// Update if integrations live on a different settings tab.
const INTEGRATION_SETTINGS = AI_SETTINGS;

/* -------------------------------------------------------------------------- */
/*  Inline helpers                                                            */
/* -------------------------------------------------------------------------- */

const linkClass =
  "font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary";

function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(linkClass, "inline-flex items-center gap-1")}
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function AppLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

type Guide = {
  id: string;
  title: string;
  intro?: string;
  steps: ReactNode[];
  note?: string;
};

type Section = {
  id: string;
  title: string;
  intro?: string;
  guides: Guide[];
};

const nameKey = <>Give it a name (e.g. &quot;Tixly&quot;)</>;

const pasteKey = (action: string) => (
  <>
    In Tixly, go to <AppLink href={AI_SETTINGS}>Settings → AI Provider</AppLink>
    , paste the key, and click <B>{action}</B>
  </>
);

const SECTIONS: Section[] = [
  {
    id: "ai-provider-key",
    title: "AI Provider Key",
    intro:
      "Tixly lets you bring your own API key from OpenAI, OpenRouter, or Anthropic. Your key is encrypted and stored securely — it is never exposed to the client or shared.",
    guides: [
      {
        id: "openai",
        title: "OpenAI",
        steps: [
          <>
            Go to{" "}
            <ExtLink href="https://platform.openai.com/api-keys">
              platform.openai.com/api-keys
            </ExtLink>
          </>,
          <>
            Click <B>Create new secret key</B>
          </>,
          nameKey,
          <>
            Copy the key — it starts with <Code>sk-proj-</Code> or{" "}
            <Code>sk-</Code>
          </>,
          pasteKey("Save"),
        ],
      },
      {
        id: "openrouter",
        title: "OpenRouter",
        intro:
          "OpenRouter gives you access to many models through a single API. It auto-selects the best model for each request.",
        steps: [
          <>
            Go to{" "}
            <ExtLink href="https://openrouter.ai/keys">
              openrouter.ai/keys
            </ExtLink>
          </>,
          <>
            Click <B>Create Key</B>
          </>,
          nameKey,
          <>
            Copy the key — it starts with <Code>sk-or-v1-</Code>
          </>,
          pasteKey("Save"),
        ],
      },
      {
        id: "anthropic",
        title: "Anthropic (Claude)",
        steps: [
          <>
            Go to{" "}
            <ExtLink href="https://console.anthropic.com/settings/keys">
              console.anthropic.com/settings/keys
            </ExtLink>
          </>,
          <>
            Click <B>Create Key</B>
          </>,
          nameKey,
          <>
            Copy the key — it starts with <Code>sk-ant-</Code>
          </>,
          pasteKey("Save"),
        ],
        note: "Your key is tested automatically before saving. If the test fails, double-check the key is active and has credits available.",
      },
      {
        id: "google",
        title: "Google",
        intro:
          "Google AI Studio Gemini is a web-based tool from Google that provides free access to Gemini models for development and prototyping. It is designed to be easy to use, with a simple interface and no API keys required for basic usage.",
        steps: [
          <>
            Go to{" "}
            <ExtLink href="https://aistudio.google.com/">
              aistudio.google.com
            </ExtLink>
          </>,
          <>
            Click <B>Get API Key</B>
          </>,
          <>Copy the key</>,
          pasteKey("Save"),
        ],
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    guides: [
      {
        id: "slack",
        title: "Slack",
        intro: "Send generated tickets directly to your Slack DMs.",
        steps: [
          <>
            Go to{" "}
            <AppLink href={INTEGRATION_SETTINGS}>
              Settings → Integrations
            </AppLink>
          </>,
          <>
            Click <B>Connect</B> next to Slack
          </>,
          <>You will be redirected to Slack&apos;s authorization page</>,
          <>Choose the workspace and approve the permissions</>,
          <>You will be redirected back — Slack is now connected</>,
        ],
        note: "When you generate a ticket, use the Slack button to send it to your DM. To disconnect, go to Settings → Integrations and click Disconnect.",
      },
      {
        id: "linear",
        title: "Linear",
        intro: "Create Linear issues directly from generated tickets.",
        steps: [
          <>
            Go to{" "}
            <ExtLink href="https://linear.app/bichitra-behera/settings/account/security">
              linear.app/settings/account/security
            </ExtLink>
          </>,
          <>
            Under <B>Personal API Keys</B>, click <B>Create key</B>
          </>,
          nameKey,
          <>
            Copy the key — it starts with <Code>lin_api_</Code>
          </>,
          <>
            In Tixly, go to{" "}
            <AppLink href={INTEGRATION_SETTINGS}>
              Settings → Integrations
            </AppLink>
            , paste the key, and click <B>Connect</B>
          </>,
        ],
        note: "When you generate a ticket, use the Linear button to create an issue. To disconnect, go to Settings → Integrations and click Disconnect.",
      },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => [s.id, ...s.guides.map((g) => g.id)]);

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article
      id={guide.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-6"
    >
      <h3 className="text-base font-semibold text-foreground">{guide.title}</h3>
      {guide.intro && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {guide.intro}
        </p>
      )}

      <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {i + 1}
            </span>
            <span className="pt-0.5 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {guide.note && (
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {guide.note}
        </p>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DocsPage() {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-50 p-4">
        <Header />
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-28">
        <div className="flex gap-8">
          {/* Mobile toggle */}
          <Button
            size="icon"
            onClick={() => setMobileOpen((open) => !open)}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90 md:hidden"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={closeMobile}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 h-full w-64 shrink-0 overflow-y-auto border-r border-border bg-background p-6 pt-24 transition-transform duration-200",
              "md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:border-0 md:bg-transparent md:p-0 md:pr-6",
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0",
            )}
          >
            <nav className="space-y-6" aria-label="Documentation">
              {SECTIONS.map((section) => {
                const sectionActive =
                  activeId === section.id ||
                  section.guides.some((g) => g.id === activeId);

                return (
                  <div key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={closeMobile}
                      className={cn(
                        "block text-sm font-medium transition-colors",
                        sectionActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {section.title}
                    </a>

                    <div className="mt-2 ml-1 border-l border-border">
                      {section.guides.map((guide) => (
                        <a
                          key={guide.id}
                          href={`#${guide.id}`}
                          onClick={closeMobile}
                          className={cn(
                            "-ml-px block border-l py-1 pl-4 text-sm transition-colors",
                            activeId === guide.id
                              ? "border-primary font-medium text-foreground"
                              : "border-transparent text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {guide.title}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0 max-w-3xl flex-1">
            <div className="space-y-16">
              {SECTIONS.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  {section.intro && (
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                      {section.intro}
                    </p>
                  )}

                  <div className="mt-8 space-y-6">
                    {section.guides.map((guide) => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                </section>
              ))}

              <footer className="border-t border-border pt-8">
                <p className="text-xs text-muted-foreground">
                  Need help?{" "}
                  <a
                    href="mailto:bichitrabehera.345@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Email{" "}
                  </a>
                </p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
