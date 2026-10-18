import { ClipboardList, Key, Zap, Copy } from "lucide-react";
import { FEATURES } from "@/lib/data";

const icons = [ClipboardList, Key, Zap, Copy];

export function Features() {
  return (
    <section className="border-t border-hairline py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Features
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-ink lg:text-5xl">
            {FEATURES.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            {FEATURES.subtitle}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.items.map((feature, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-hairline bg-canvas p-8 transition-all hover:border-dash hover:shadow-lg hover:shadow-black/5"
              >
                {/* Icon */}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-canvas transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-ink">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>

                {/* Decorative element */}
                <div className="absolute right-0 top-0 h-px w-16 bg-gradient-to-r from-transparent to-hairline" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
