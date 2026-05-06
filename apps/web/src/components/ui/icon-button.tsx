import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  tone?: "default" | "primary" | "danger";
};

export function IconButton({
  icon,
  label,
  tone = "default",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone === "default" && "border-border text-primary hover:bg-accent",
        tone === "primary" && "border-primary bg-primary text-white hover:bg-primary-dark",
        tone === "danger" && "border-red-100 text-destructive hover:bg-red-50",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
