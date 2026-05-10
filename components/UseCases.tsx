import { Bug, ClipboardList, Palette, Ticket } from "lucide-react";
import { USE_CASES } from "@/lib/data";

const icons = [Bug, ClipboardList, Palette, Ticket];

export function UseCases() {
  return (
    <section className="py-16 lg:py-24 border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            {USE_CASES.subtitle}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">{USE_CASES.title}</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {USE_CASES.items.map((item, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 p-6 hover:border-green-300 hover:shadow-md transition bg-white"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}