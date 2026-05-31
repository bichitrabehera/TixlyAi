"use client";
import Link from "next/link";
import { Slack, Jira, Notion } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { HERO } from "@/lib/data";
import TixlyCard from "./TixlyCard";

const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
  Slack: <Slack className="h-5 w-5" />,
  Jira: <Jira className="h-5 w-5" />,
  Notion: <Notion className="h-5 w-5" />,
  Linear: <CgLinear className="h-5 w-5" />,
};

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pt-40">
      <div className="text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-800 mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          {HERO.badge}
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-3xl lg:text-7xl text-slate-900">
          {HERO.title}
          <br />
          <span className="italic bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
            {HERO.titleHighlight}
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-8 max-w-xl text-base md:text-lg lg:text-xl leading-relaxed text-slate-500">
          {HERO.description}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex gap-3 justify-center items-center flex-wrap">
          <Link
            href="/dashboard/generate"
            className="group inline-flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl hover:shadow-green-900/20"
          >
            {HERO.cta}
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>

          <a
            href="#how"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            {HERO.secondaryCta}
          </a>
        </div>

        <TixlyCard />

        <div className="relative mt-10">
          <div className="mb-16 overflow-hidden rounded-xl shadow-green-950 border border-slate-200 shadow-sm">
            <img
              src="/Banner1.jpeg"
              alt="Tixly dashboard preview"
              fetchPriority="high"
              className="w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-20">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            {HERO.integrationsLabel}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {HERO.integrations.map((name) => (
              <div
                key={name}
                className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-default"
              >
                <span className="text-slate-400 transition-colors group-hover:text-slate-700">
                  {INTEGRATION_ICONS[name]}
                </span>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
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
