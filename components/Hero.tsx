import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Slack, Jira, Notion } from "developer-icons";
import { HERO } from "@/lib/data";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-xl bg-green-200 px-4 py-1.5 text-sm font-medium text-neutral-700 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {HERO.badge}
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
          {HERO.title}
          <br />
          <span className="bg-linear-to-b italic from-gray-800 to-green-700 bg-clip-text text-transparent">
            {HERO.titleHighlight}
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-8 max-w-2xl text-sm md:text-lg leading-relaxed text-slate-600">
          {HERO.description}
        </p>

        {/* CTA */}
        <div className="mt-12 flex gap-4 sm:flex-row justify-center items-center">
          <Link
            href="/generate"
            className="group relative inline-flex items-center rounded-xl bg-green-700 px-4 py-2 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/10"
          >
            {HERO.cta}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href={HERO.secondaryCta.startsWith("#") ? HERO.secondaryCta : "#how"}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-all hover:border-slate-400"
          >
            {HERO.secondaryCta}
          </a>
        </div>

        {/* Integration icons */}
        <p className="mt-8 text-sm text-slate-500">
          {HERO.integrationsLabel}
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          {HERO.integrations.map((name) => (
            <div
              key={name}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all group-hover:border-slate-900 group-hover:bg-slate-50 group-hover:shadow-md group-hover:-translate-y-1">
                {name === "Slack" && <Slack className="h-6 w-6 text-slate-400 group-hover:text-slate-900" />}
                {name === "Jira" && <Jira className="h-6 w-6 text-slate-400 group-hover:text-slate-900" />}
                {name === "Notion" && <Notion className="h-6 w-6 text-slate-400 group-hover:text-slate-900" />}
              </div>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}