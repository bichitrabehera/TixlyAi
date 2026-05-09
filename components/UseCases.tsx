import { Bug, ClipboardList, Palette, Ticket } from "lucide-react";

export function UseCases() {
  const cases = [
    {
      title: "Bug reports",
      description: "Capture error details from screenshots without retyping",
      icon: Bug,
    },
    {
      title: "Testing notes",
      description: "Document test results and edge cases quickly",
      icon: ClipboardList,
    },
    {
      title: "Design feedback",
      description: "Extract UI text and details for design reviews",
      icon: Palette,
    },
    {
      title: "Support tickets",
      description: "Convert user screenshots into actionable tickets",
      icon: Ticket,
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
              className="rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition bg-white"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
