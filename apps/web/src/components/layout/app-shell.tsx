import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { TopBar } from "./top-bar";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  searchPlaceholder?: string;
  className?: string;
};

export function AppShell({
  children,
  sidebar,
  searchPlaceholder,
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar searchPlaceholder={searchPlaceholder} />
      <main className={cn("sf-wave-bg min-h-[calc(100vh-6rem)]", className)}>
        <div className="sf-content flex gap-6 px-10 py-12">
          {sidebar}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
