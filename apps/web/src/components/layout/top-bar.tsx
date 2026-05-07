import Link from "next/link";
import { Bell, Search, Settings, UserRound } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";

import { BrandLogo } from "./brand-logo";

type TopBarProps = {
  searchPlaceholder?: string;
};

export function TopBar({
  searchPlaceholder = "Search papers, workspaces, or projects",
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="flex h-24 items-center justify-between gap-8 px-9">
        <BrandLogo />
        <div className="hidden w-full max-w-[560px] md:block">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Global search"
              className="h-14 rounded-lg pl-14 text-lg shadow-none"
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <IconButton icon={<Bell className="h-6 w-6" />} label="Notifications" />
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings className="h-6 w-6" />
          </Link>
          <Link
            href="/profile"
            aria-label="User profile"
            title="User profile"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-primary transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserRound className="h-8 w-8" />
          </Link>
        </div>
      </div>
    </header>
  );
}
