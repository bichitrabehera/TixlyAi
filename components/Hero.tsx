import Link from "next/link";
import { Slack, Jira } from "developer-icons";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-green-200 px-4 py-1.5 text-sm font-medium text-slate-700 mb-8">
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
            className="group relative rounded-xl bg-green-700 px-4 py-2 font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/10 hover:-translate-y-0.5"
          >
            Try it now
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
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
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            No signup needed
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Works with any tracker
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Instant results
          </div>
        </div>

        {/* Integration icons */}
        <p className="mt-8 text-sm text-slate-500">
          Works with your existing tools
        </p>

        <div className="mt-4 flex items-center justify-center gap-8 opacity-70">
          <Slack className="h-6 w-6 text-slate-500 hover:text-[#4A154B] hover:scale-110 transition" />
          <Jira className="h-6 w-6 text-slate-500 hover:text-[#0052CC] hover:scale-110 transition" />
        </div>
      </div>
    </section>
  );
}
