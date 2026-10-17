import { cn } from "@/lib/utils";

export function ShimmerText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("shimmer-text inline-block", className)}>
      {children}
    </span>
  );
}

export function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("shimmer-block rounded-md", className)}
    />
  );
}
