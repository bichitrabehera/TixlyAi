import { ClipboardPaste, Sparkles, Send } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/data";

const steps = [
  {
    icon: ClipboardPaste,
    title: HOW_IT_WORKS.steps[0].title,
    description: HOW_IT_WORKS.steps[0].description,
  },
  {
    icon: Sparkles,
    title: HOW_IT_WORKS.steps[1].title,
    description: HOW_IT_WORKS.steps[1].description,
  },
  {
    icon: Send,
    title: HOW_IT_WORKS.steps[2].title,
    description: HOW_IT_WORKS.steps[2].description,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-hairline py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-hairline px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted">
            How it works
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {HOW_IT_WORKS.title}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="bg-canvas p-8 transition-colors hover:bg-panel"
            >
              <span className="text-xs font-medium text-ink-3">
                0{index + 1}
              </span>

              <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-panel">
                <Icon className="h-5 w-5 text-ink" />
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-ink">{title}</h3>

                <p className="mt-2 text-sm leading-7 text-muted">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
