import React from "react";

const Header = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">{children}</div>
      </div>

      {/* subtle divider */}
      <div className="mt-6 h-px bg-[var(--border)]/60" />
    </div>
  );
};

export default Header;
