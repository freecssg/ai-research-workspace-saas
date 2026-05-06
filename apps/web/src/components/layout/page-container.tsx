import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  size?: "default" | "wide" | "full";
  className?: string;
};

export function PageContainer({ children, size = "wide", className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-[1480px]",
        size === "full" && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
