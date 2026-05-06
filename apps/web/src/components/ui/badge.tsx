import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "green" | "amber" | "red" | "neutral";
};

export function Badge({ tone = "blue", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "blue" && "bg-blue-50 text-primary",
        tone === "green" && "bg-emerald-50 text-success-foreground",
        tone === "amber" && "bg-amber-50 text-warning-foreground",
        tone === "red" && "bg-red-50 text-destructive",
        tone === "neutral" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
