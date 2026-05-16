import { GitHubDark, LinkedIn, XDark } from "developer-icons";
import { SOCIALS, FOOTER, SITE } from "@/lib/data";
import type { ComponentType } from "react";

export function Footer() {
  const iconMap = {
    github: GitHubDark,
    linkedin: LinkedIn,
    x: XDark,
  };

  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
        {/* TOP GRID */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {SITE.name}
            </h3>
            <p className="mt-3 text-sm text-slate-600 max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Product
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              {FOOTER.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Connect
            </h4>

            <div className="flex gap-3">
              {SOCIALS.map((social, index) => {
                const Icon = iconMap[social.platform.toLowerCase()];
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all 
                      hover:-translate-y-0.5 hover:shadow-md hover:text-slate-900"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* EXTRA / TRUST */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Built for
            </h4>
            <p className="text-sm text-slate-600">
              Developers, startups, and teams who hate slow workflows.
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-slate-200" />

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>

          <p className="text-slate-500 text-center">
            Built with <span className="text-red-500">♥</span> by{" "}
            <span className="font-medium text-slate-700">{FOOTER.builtBy}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
