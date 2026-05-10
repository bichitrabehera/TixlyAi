import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CALL_TO_ACTION } from "@/lib/data";

export function CallToAction() {
  return (
    <section className="py-16 lg:py-24 border-t border-slate-200">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-green-700" />
          {CALL_TO_ACTION.badge}
        </div>
        <h2 className="text-4xl font-bold mb-6 text-slate-900">
          {CALL_TO_ACTION.title}
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          {CALL_TO_ACTION.description}
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-2 font-medium text-white transition hover:bg-green-600"
        >
          {CALL_TO_ACTION.button}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
