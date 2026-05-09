export function Features() {
  const features = [
    {
      title: "Instant OCR extraction",
      description: "Extracts text from screenshots in milliseconds",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Structured output format",
      description: "Ready-to-paste tickets with proper formatting",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      title: "One-click copy",
      description: "Copy formatted tickets to clipboard instantly",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="border-t border-slate-200 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-3">
            Features
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight lg:text-5xl">
            Built for speed.
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to turn screenshots into structured tickets
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-110">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="absolute top-0 right-0 h-px w-16 bg-gradient-to-r from-transparent to-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
