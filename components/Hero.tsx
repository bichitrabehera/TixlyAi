"use client";
import Link from "next/link";
import { Slack, Jira, Notion } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { HERO } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import TixlyCard from "./TixlyCard";

const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
  Slack: <Slack className="h-5 w-5" />,
  Jira: <Jira className="h-5 w-5" />,
  Notion: <Notion className="h-5 w-5" />,
  Linear: <CgLinear className="h-5 w-5" />,
};

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <div className="text-center">
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {HERO.badge}
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink lg:text-6xl">
          {HERO.title}
          <br />
          <span className="italic text-primary">{HERO.titleHighlight}</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-sm">
          {HERO.description}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="group gap-2 px-7 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20"
          >
            <Link href={ROUTES.generate}>{HERO.cta}</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-canvas px-7 font-semibold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <a href="#how">{HERO.secondaryCta}</a>
          </Button>
        </div>

        <TixlyCard />

        <div
          className="relative mt-10 overflow-hidden rounded-xl border border-neutral-300 p-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-315deg, #c9c9c9ff 0, #e6e6e6ff 1px, transparent 1px, transparent 50%)",
            backgroundSize: "8px 8px",
          }}
        >
          <img
            src="/Banner1.png"
            alt="Tixly dashboard preview"
            fetchPriority="high"
            className="w-full object-cover rounded-lg"
          />
        </div>

        <div className="mt-20">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-3">
            {HERO.integrationsLabel}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {HERO.integrations.map((name) => (
              <div
                key={name}
                className="group flex cursor-default items-center gap-3 rounded-xl border border-hairline bg-canvas px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-dash hover:shadow-md"
              >
                <span className="text-ink-3 transition-colors group-hover:text-ink">
                  {INTEGRATION_ICONS[name]}
                </span>
                <span className="text-sm font-medium text-muted transition-colors group-hover:text-ink">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
