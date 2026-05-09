import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-teal-700" />
          Fastest path to a ticket
        </div>
        <h2 className="text-4xl font-bold mb-6 text-slate-900">
          Ready to save time?
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Try TixlyAi now. Paste a screenshot and see how fast you can generate a ticket.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-8 py-3 font-medium text-white transition hover:bg-teal-600"
        >
          Open demo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
