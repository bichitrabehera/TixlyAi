import * as React from "react";

import { cn } from "@/lib/utils";

interface FieldLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export function FieldLabel({
  required,
  optional,
  className,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </label>
  );
}
