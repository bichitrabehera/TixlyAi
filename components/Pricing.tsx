import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING } from "@/lib/data";

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-slate-200 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 sm:text-5xl lg:text-5xl text-slate-900">
            {PRICING.title}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {PRICING.subtitle}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          {PRICING.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-green-300 bg-green-50 shadow-lg shadow-green-900/10"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-700 px-4 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-green-700 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/20"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          All plans require you to bring your own AI API key. Keys are encrypted
          at rest and never exposed.
        </p>
      </div>
    </section>
  );
}
