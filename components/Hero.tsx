import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Slack, Jira, Notion } from "developer-icons";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-xl bg-green-200 px-4 py-1.5 text-sm font-medium text-slate-700 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
          AI-powered bug reporting
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
          Screenshot to ticket.
          <br />
          <span className="bg-linear-to-b italic from-gray-800 to-green-700 bg-clip-text text-transparent">
            No typing required.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-slate-600">
          Paste a screenshot, get a structured bug ticket. AI extracts text and
          generates organized output you can paste straight into your tracker.
        </p>

        {/* CTA */}
        <div className="mt-12 flex gap-4 sm:flex-row justify-center items-center">
          <Link
            href="/demo"
            className="group relative inline-flex items-center rounded-xl bg-green-700 px-4 py-2 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/10"
          >
            Try it now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#how"
            className="rounded-xl border-2 border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-all hover:border-slate-400"
          >
            Learn how
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            No signup needed
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Works with any tracker
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Instant results
          </div>
        </div>

        {/* Integration icons */}
        <p className="mt-8 text-sm text-slate-500">
          Works with your existing tools
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="group flex flex-col items-center gap-2 cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all group-hover:border-[#4A154B] group-hover:bg-[#4A154B]/5 group-hover:shadow-md group-hover:-translate-y-1">
              <Slack className="h-6 w-6 text-slate-400 transition-colors group-hover:text-[#4A154B]" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
              Slack
            </span>
          </div>

          <div className="group flex flex-col items-center gap-2 cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all group-hover:border-[#0052CC] group-hover:bg-[#0052CC]/5 group-hover:shadow-md group-hover:-translate-y-1">
              <Jira className="h-6 w-6 text-slate-400 transition-colors group-hover:text-[#0052CC]" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
              Jira
            </span>
          </div>

          <div className="group flex flex-col items-center gap-2 cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all group-hover:border-slate-900 group-hover:bg-slate-50 group-hover:shadow-md group-hover:-translate-y-1">
              <Notion className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-900" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
              Notion
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
