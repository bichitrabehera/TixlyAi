import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-6 z-50 mx-4 lg:mx-8">
      <div className="mx-auto w-fit rounded-full border border-slate-900/10 backdrop-blur-xl shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-1 px-2 py-2">
          <Link
            href="/"
            className="font-bold px-4 py-2 text-base tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
          >
            SnapShot
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="#how"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100/80 transition-all"
            >
              How it works
            </Link>

            <Link
              href="/demo"
              className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-sm ml-1"
            >
              Demo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
