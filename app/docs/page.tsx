"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ExternalLink, Menu, X, ArrowLeft, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "ai-provider-key",
    label: "AI Provider Key",
    items: [
      { id: "openai", label: "OpenAI" },
      { id: "openrouter", label: "OpenRouter" },
      { id: "anthropic", label: "Anthropic (Claude)" },
    ],
  },
  {
    id: "connecting-integrations",
    label: "Integrations",
    items: [
      { id: "slack", label: "Slack" },
      { id: "linear", label: "Linear" },
    ],
  },
  {
    id: "plans-billing",
    label: "Plans & Billing",
    items: [],
  },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    const ids = sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#ecfff1]">
      <header className="fixed top-0 left-0 right-0 p-4 z-50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto w-fit rounded-full border border-slate-900/10 backdrop-blur-xl shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-1 px-2 py-1">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold tracking-tight text-slate-900 transition-colors hover:bg-green-100/80"
              >
                Tixly
              </Link>
              <span className="text-slate-300 text-sm">/</span>
              <Link
                href="/docs"
                className="rounded-full px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-green-100/80"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16">
        <div className="flex gap-8">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg md:hidden"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <aside
            className={`fixed top-0 left-0 z-40 h-full w-64 shrink-0 overflow-y-auto bg-white border-r border-slate-200 p-6 transition-transform duration-200 md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:block md:border-0 md:bg-transparent ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div className="md:hidden flex items-center justify-between mb-6 pt-4">
              <span className="text-sm font-semibold text-slate-900">
                Navigation
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Settings
            </Link>

            <nav className="space-y-6">
              {sections.map((section) => {
                const isActive =
                  activeId === section.id ||
                  section.items.some((i) => i.id === activeId);
                return (
                  <div key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={`block text-sm font-medium transition-colors ${
                        isActive
                          ? "text-slate-900"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {section.label}
                    </a>
                    {section.items.length > 0 && (
                      <div className="mt-2 ml-3 space-y-1.5 border-l border-slate-200 pl-3">
                        {section.items.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => setMobileOpen(false)}
                            className={`block text-sm transition-colors ${
                              activeId === item.id
                                ? "text-slate-900 font-medium"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <a
                href="/docs"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
                View all docs
              </a>
            </div>
          </aside>

          <main className="flex-1 min-w-0 max-w-3xl">
            <div className="space-y-16">
              {/* AI Provider Key */}
              <section id="ai-provider-key">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  AI Provider Key
                </h2>
                <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                  Tixly lets you bring your own API key from OpenAI, OpenRouter,
                  or Anthropic. Your key is encrypted and stored securely — it
                  is never exposed to the client or shared.
                </p>

                <div
                  id="openai"
                  className="scroll-mt-24 mb-8 p-6 rounded-2xl border border-slate-200 bg-white"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    OpenAI
                  </h3>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2 inline-flex items-center gap-1"
                        >
                          platform.openai.com/api-keys{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        2
                      </span>
                      <span>
                        Click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Create new secret key
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        3
                      </span>
                      <span>Give it a name (e.g. &quot;Tixly&quot;)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        4
                      </span>
                      <span>
                        Copy the key — it starts with{" "}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-800 font-mono">
                          sk-proj-
                        </code>{" "}
                        or{" "}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-800 font-mono">
                          sk-
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        5
                      </span>
                      <span>
                        In Tixly, go to{" "}
                        <Link
                          href="/dashboard/settings?tab=ai"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2"
                        >
                          Settings → AI Provider
                        </Link>
                        , paste the key, and click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Save
                        </strong>
                      </span>
                    </li>
                  </ol>
                </div>

                <div
                  id="openrouter"
                  className="scroll-mt-24 mb-8 p-6 rounded-2xl border border-slate-200 bg-white"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    OpenRouter
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    OpenRouter gives you access to many models through a single
                    API. It auto-selects the best model for each request.
                  </p>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2 inline-flex items-center gap-1"
                        >
                          openrouter.ai/keys{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        2
                      </span>
                      <span>
                        Click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Create Key
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        3
                      </span>
                      <span>Give it a name (e.g. &quot;Tixly&quot;)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        4
                      </span>
                      <span>
                        Copy the key — it starts with{" "}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-800 font-mono">
                          sk-or-v1-
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        5
                      </span>
                      <span>
                        In Tixly, go to{" "}
                        <Link
                          href="/dashboard/settings?tab=ai"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2"
                        >
                          Settings → AI Provider
                        </Link>
                        , paste the key, and click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Save
                        </strong>
                      </span>
                    </li>
                  </ol>
                </div>

                <div
                  id="anthropic"
                  className="scroll-mt-24 p-6 rounded-2xl border border-slate-200 bg-white"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    Anthropic (Claude)
                  </h3>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <a
                          href="https://console.anthropic.com/settings/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2 inline-flex items-center gap-1"
                        >
                          console.anthropic.com/settings/keys{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        2
                      </span>
                      <span>
                        Click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Create Key
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        3
                      </span>
                      <span>Give it a name (e.g. &quot;Tixly&quot;)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        4
                      </span>
                      <span>
                        Copy the key — it starts with{" "}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-800 font-mono">
                          sk-ant-
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        5
                      </span>
                      <span>
                        In Tixly, go to{" "}
                        <Link
                          href="/dashboard/settings?tab=ai"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2"
                        >
                          Settings → AI Provider
                        </Link>
                        , paste the key, and click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Save
                        </strong>
                      </span>
                    </li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-4">
                    Your key is tested automatically before saving. If the test
                    fails, double-check the key is active and has credits
                    available.
                  </p>
                </div>
              </section>

              {/* Connecting Integrations */}
              <section id="connecting-integrations">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Integrations
                </h2>

                <div
                  id="slack"
                  className="scroll-mt-24 mb-8 p-6 rounded-2xl border border-slate-200 bg-white"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Slack
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Send generated tickets directly to your Slack DMs.
                  </p>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <Link
                          href="/dashboard/settings?tab=integrations"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2"
                        >
                          Settings → Integrations
                        </Link>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        2
                      </span>
                      <span>
                        Click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Connect
                        </strong>{" "}
                        next to Slack
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        3
                      </span>
                      <span>
                        You will be redirected to Slack&apos;s authorization
                        page
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        4
                      </span>
                      <span>
                        Choose the workspace and approve the permissions
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        5
                      </span>
                      <span>
                        You will be redirected back — Slack is now connected
                      </span>
                    </li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-4">
                    When you generate a ticket, use the Slack button to send it
                    to your DM. To disconnect, go to Settings → Integrations and
                    click Disconnect.
                  </p>
                </div>

                <div
                  id="linear"
                  className="scroll-mt-24 p-6 rounded-2xl border border-slate-200 bg-white"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Linear
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Create Linear issues directly from generated tickets.
                  </p>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <a
                          href="https://linear.app/settings/api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2 inline-flex items-center gap-1"
                        >
                          linear.app/settings/api{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        2
                      </span>
                      <span>
                        Under{" "}
                        <strong className="text-slate-900 font-semibold">
                          Personal API Keys
                        </strong>
                        , click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Create key
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        3
                      </span>
                      <span>Give it a name (e.g. &quot;Tixly&quot;)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        4
                      </span>
                      <span>
                        Copy the key — it starts with{" "}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-800 font-mono">
                          lin_api_
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                        5
                      </span>
                      <span>
                        In Tixly, go to{" "}
                        <Link
                          href="/dashboard/settings?tab=integrations"
                          className="text-green-700 hover:text-green-800 underline underline-offset-2"
                        >
                          Settings → Integrations
                        </Link>
                        , paste the key, and click{" "}
                        <strong className="text-slate-900 font-semibold">
                          Connect
                        </strong>
                      </span>
                    </li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-4">
                    When you generate a ticket, use the Linear button to create
                    an issue. To disconnect, go to Settings → Integrations and
                    click Disconnect.
                  </p>
                </div>
              </section>

              {/* Plans & Billing */}
              <section id="plans-billing">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Plans &amp; Billing
                </h2>

                <div className="p-6 rounded-2xl border border-slate-200 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Free
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          10 tickets per month
                        </p>
                      </div>
                      <span className="text-sm text-slate-500">$0</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Pro
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Unlimited tickets
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
                        $5/month (₹449)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  To upgrade, go to{" "}
                  <Link
                    href="/dashboard/settings?tab=plan"
                    className="text-green-700 hover:text-green-800 underline underline-offset-2"
                  >
                    Settings → Plan &amp; Billing
                  </Link>{" "}
                  and click{" "}
                  <strong className="text-slate-900 font-semibold">
                    Upgrade to Pro
                  </strong>
                  . Payment is processed through Razorpay.
                </p>
              </section>

              <div className="pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-400">
                  Need help?{" "}
                  <a
                    href="https://github.com/anomalyco/opencode/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline"
                  >
                    Open an issue
                  </a>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
