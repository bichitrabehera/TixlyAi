import React from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For trying out Tixly",
    features: [
      "10 tickets per day",
      "Basic ticket generation",
      "Community support",
    ],
    highlight: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    description: "For active developers & small teams",
    features: [
      "50 tickets per day",
      "Faster generation",
      "Priority support",
      "Slack integration (soon)",
    ],
    highlight: true,
  },
];

const Pricing = () => {
  return (
    <div className=" text-[var(--text)] px-6 py-20">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-[var(--muted)] mt-3">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-2xl border transition ${
              plan.highlight
                ? "border-[var(--primary)] glow"
                : "border-[var(--border)]"
            } bg-[var(--card)]`}
          >
            {/* Title */}
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-[var(--muted)] text-sm mt-1">
              {plan.description}
            </p>

            {/* Price */}
            <div className="mt-6 text-3xl font-bold">
              {plan.price}
              {plan.price !== "$0" && (
                <span className="text-sm text-[var(--muted)] ml-1">/month</span>
              )}
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✔</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className={`mt-8 w-full py-3 rounded-xl font-medium transition ${
                plan.highlight
                  ? "bg-[var(--primary)] text-black hover:opacity-90"
                  : "bg-[var(--card-2)] border border-[var(--border)]"
              }`}
            >
              {plan.highlight ? "Upgrade" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
