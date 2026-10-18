import Link from "next/link";
import { GitHubDark, LinkedIn, XDark } from "developer-icons";
import { Globe, Mail, Ticket } from "lucide-react";
import { SOCIALS, FOOTER, SITE } from "@/lib/data";
import type { ComponentType } from "react";

export function Footer() {
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    github: GitHubDark,
    linkedin: LinkedIn,
    x: XDark,
    mail: Mail,
    portfolio: Globe,
  };

  const legalLinks = FOOTER.links.filter((link) =>
    /^\/(privacy|terms)/.test(link.href),
  );
  const productLinks = FOOTER.links.filter(
    (link) => !legalLinks.includes(link),
  );

  const columns = [
    { title: "Product", links: productLinks },
    { title: "Legal", links: legalLinks },
  ];

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-lg font-semibold tracking-tight text-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary bg-brand-tile">
                <Ticket className="h-4 w-4 text-ink" aria-hidden />
              </span>
              {SITE.name}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted">Connect:</p>

            <div className="mt-6 flex gap-2">
              {SOCIALS.map((social) => {
                const Icon = iconMap[social.platform.toLowerCase()];

                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-control text-muted transition-colors hover:bg-panel hover:text-ink"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 sm:gap-x-24">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-xs font-semibold text-ink">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{FOOTER.copyright}</p>
          {/* <p>Built by {FOOTER.builtBy}</p> */}
        </div>
      </div>
    </footer>
  );
}
