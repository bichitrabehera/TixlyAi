import { GitHubDark, LinkedIn, XDark } from "developer-icons";
import { SOCIALS, FOOTER, SITE } from "@/lib/data";
import type { ComponentType } from "react";

export function Footer() {
  // Map of platform names to developer-icons components
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    github: GitHubDark,
    linkedin: LinkedIn,
    x: XDark,
  };

  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          {/* Brand */}
          <div className="text-center">
            <div className="mb-2 font-bold text-xl tracking-tight text-slate-900">
              {SITE.name}
            </div>
            <p className="text-sm text-slate-600">{SITE.tagline}</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            {FOOTER.links.map((link) => (
              <a
                href={link.href}
                key={link.label}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {SOCIALS.map((social, index) => {
              const IconComponent = iconMap[social.platform.toLowerCase()];
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all"
                  aria-label={social.platform}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all group-hover:bg-white shadow-2xs">
                    {IconComponent ? (
                      <IconComponent className="h-5 w-5" />
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>

          <p className="text-sm text-slate-500 text-center">
            Built with <span className="text-red-500 inline-block">❤️</span> by{" "}
            <span className="font-semibold text-slate-700">
              {FOOTER.builtBy}
            </span>
          </p>

          <div className="text-xs text-slate-400">{FOOTER.copyright}</div>
        </div>
      </div>
    </footer>
  );
}
