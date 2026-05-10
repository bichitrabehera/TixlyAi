import { ArrowRight, ClipboardCheck, ClipboardPaste, Sparkles } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/data";

const icons = [ClipboardPaste, Sparkles, ClipboardCheck];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-slate-200 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight lg:text-5xl">
            {HOW_IT_WORKS.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {HOW_IT_WORKS.subtitle}
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-3 relative">
          {HOW_IT_WORKS.steps.map((item, idx) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-slate-900 text-slate-900 shadow-lg mb-6">
                  {(() => {
                    const Icon = icons[idx];
                    return <Icon className="h-8 w-8" />;
                  })()}
                </div>

                <div className="text-sm font-bold text-slate-400 tracking-wider mb-3">
                  STEP {item.step}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-slate-600 leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="/generate"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-slate-700"
          >
            {HOW_IT_WORKS.bottomLink}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}