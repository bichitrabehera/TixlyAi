import { Bug, ClipboardList, Palette, Ticket } from "lucide-react";
import { USE_CASES } from "@/lib/data";

const icons = [Bug, ClipboardList, Palette, Ticket];

export function UseCases() {
  return (
    <section className="border-t border-hairline py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {USE_CASES.subtitle}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-ink">
            {USE_CASES.title}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {USE_CASES.items.map((item, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={item.title}
                className="rounded-xl border border-hairline bg-canvas p-6 transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="text-muted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
