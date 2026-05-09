import { XDark } from "developer-icons";

export function Footer() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2 font-bold text-xl tracking-tight text-slate-900">
              SnapShot
            </div>
            <p className="text-sm text-slate-600">
              Screenshot to ticket, instantly.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <a
              href="/how-it-works"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="/demo"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Demo
            </a>
          </nav>

          <div className="w-full max-w-md h-px bg-slate-200" />

          <div className="flex flex-col items-center gap-4">
            <a
              href="https://x.com/bichitradotdev"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <XDark className="text-lg h-5 w-5 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">bichitradotdev</span>
            </a>

            <p className="text-sm text-slate-500">
              Built with <span className="text-red-500 animate-pulse">❤️</span>{" "}
              by{" "}
              <span className="font-semibold text-slate-700">
                Bichitra Behera
              </span>
            </p>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 SnapShot. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
