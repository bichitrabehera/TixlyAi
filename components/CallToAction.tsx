import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <h2 className="text-4xl font-bold mb-6 text-slate-900">
          Ready to save time?
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Try SnapShot now. Paste a screenshot and see how fast you can generate a ticket.
        </p>
        <Link
          href="/demo"
          className="inline-block rounded-md bg-teal-700 px-8 py-3 font-medium text-white transition hover:bg-teal-600"
        >
          Open demo
        </Link>
      </div>
    </section>
  );
}
