import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-24 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-(--border) bg-(--card-2) text-(--muted)">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-(--text)">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}