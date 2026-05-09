export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Paste",
      description: "Drop a screenshot or paste from clipboard (Ctrl+V)",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Generate",
      description: "AI extracts text and creates a structured ticket",
      icon: (
        <svg
          className="w-8 h-8"
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
      step: "03",
      title: "Copy",
      description: "Copy and paste into Linear, Jira, or your tracker",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how" className="border-t border-slate-200 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight lg:text-5xl">
            Three steps.
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From screenshot to structured ticket in seconds
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-3 relative">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-slate-900 text-slate-900 shadow-lg mb-6">
                  {item.icon}
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
            href="/demo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors group"
          >
            See it in action
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
