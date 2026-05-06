import Link from "next/link";
import type { ComponentType } from "react";
import {
  Bot,
  Database,
  FileText,
  Folder,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
};

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Knowledge Bases", href: "/knowledge-bases", icon: Database },
  { label: "Workspaces", href: "/workspaces", icon: Folder },
  { label: "Projects", href: "/projects", icon: FileText },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Outputs", href: "/outputs", icon: Sparkles },
  { label: "AI Agents", href: "/agents", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarNavProps = {
  items?: NavItem[];
  activeHref?: string;
  className?: string;
};

export function SidebarNav({ items = mainNavigation, activeHref, className }: SidebarNavProps) {
  return (
    <aside className={cn("w-[300px] shrink-0 rounded-lg border bg-card p-4 shadow-soft", className)}>
      <nav className="space-y-2" aria-label="Main navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.active || item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 items-center gap-3 rounded-md px-4 text-base font-semibold text-muted-foreground transition-colors",
                active && "bg-accent text-primary",
                !active && "hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
