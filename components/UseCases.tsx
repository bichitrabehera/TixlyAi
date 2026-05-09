export function UseCases() {
  const cases = [
    {
      title: "Bug reports",
      description: "Capture error details from screenshots without retyping",
    },
    {
      title: "Testing notes",
      description: "Document test results and edge cases quickly",
    },
    {
      title: "Design feedback",
      description: "Extract UI text and details for design reviews",
    },
    {
      title: "Support tickets",
      description: "Convert user screenshots into actionable tickets",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            USE CASES
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">Works everywhere.</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {cases.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition bg-white"
            >
              <h3 className="font-semibold text-lg mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
