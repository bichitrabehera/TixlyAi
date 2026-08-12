import { GitHubDark, LinkedIn, XDark } from "developer-icons";
import { Globe, Mail } from "lucide-react";
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

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-full justify-end py-4">
        <div className="flex gap-3">
          {SOCIALS.map((social, index) => {
            const Icon = iconMap[social.platform.toLowerCase()];

            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
                className="group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-md">
                  {Icon && <Icon className="h-4 w-4" />}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
