import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="sticky z-50">
       <div className="bg-amber-50 mb-6 border-b border-amber-100 py-2 text-center">
        <p className="text-sm text-amber-800">
          🚧 TixlyAi v1 — Early MVP. More features (login, Slack, Jira) coming soon.
        </p>
        <p className="text-xs text-amber-600 mt-0.5">Thanks for trying it early 🙌</p>
      </div>
      <div className="mx-auto w-fit rounded-full border border-slate-900/10 backdrop-blur-xl shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-1 px-2 py-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold tracking-tight text-slate-900 transition-colors hover:bg-slate-100/80 hover:text-slate-700"
          >
            TixlyAi
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="#how"
              className="text-sm font-medium text-slate-700 px-4 py-2 rounded-full transition-all hover:bg-slate-100/80 hover:text-slate-900"
            >
              How it works
            </Link>

            <Link
              href="/demo"
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
            >
              Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
