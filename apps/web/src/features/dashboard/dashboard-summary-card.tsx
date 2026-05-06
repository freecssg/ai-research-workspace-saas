import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type DashboardRecentItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type DashboardAction = {
  label: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type DashboardSummaryCardProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  maturityValue: string;
  capacityValue: string;
  progress: number;
  items: DashboardRecentItem[];
  itemFallback: {
    icon: ReactNode;
    title: string;
    description: string;
  };
  createAction: DashboardAction;
  viewAction: DashboardAction;
  sectionError?: string;
};

function DashboardActionLink({
  action,
  variant,
}: {
  action: DashboardAction;
  variant: "primary" | "secondary";
}) {
  const classes = cn(
    buttonVariants({
      variant,
      size: "lg",
    }),
    "h-14 min-w-[152px] rounded-md px-7 text-lg",
    variant === "primary" &&
      "bg-gradient-to-b from-primary to-primary-dark shadow-[0_10px_20px_rgba(0,95,214,0.18)]",
  );

  if (action.disabled || !action.href) {
    return (
      <button
        type="button"
        className={classes}
        disabled
        title={action.disabledReason}
      >
        {variant === "primary" ? <Plus className="h-6 w-6" /> : null}
        {action.label}
        {variant === "secondary" ? <ChevronRight className="h-5 w-5" /> : null}
      </button>
    );
  }

  return (
    <Link href={action.href} className={classes} title={action.disabledReason}>
      {variant === "primary" ? <Plus className="h-6 w-6" /> : null}
      {action.label}
      {variant === "secondary" ? <ChevronRight className="h-5 w-5" /> : null}
    </Link>
  );
}

export function DashboardSummaryCard({
  title,
  icon: Icon,
  maturityValue,
  capacityValue,
  progress,
  items,
  itemFallback,
  createAction,
  viewAction,
  sectionError,
}: DashboardSummaryCardProps) {
  return (
    <Card className="flex min-h-[536px] flex-col p-7">
      <div className="flex items-center gap-5 border-b pb-5">
        <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="text-[1.65rem] font-extrabold tracking-normal text-foreground">
          {title}
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-base text-muted-foreground">
        <div className="flex justify-between gap-4">
          <span>Maturity</span>
          <span className="text-right font-medium text-foreground">
            {maturityValue}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Capacity</span>
          <span className="text-right font-medium text-foreground">
            {capacityValue}
          </span>
        </div>
        <ProgressBar value={progress} className="mt-5" />
      </div>

      <div className="mt-8 flex-1 space-y-3 border-b pb-7">
        {sectionError ? (
          <div className="rounded-md border border-warning/20 bg-warning/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {sectionError}
          </div>
        ) : null}

        {items.length > 0 ? (
          items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex h-12 items-center justify-between rounded-md px-1 text-base font-medium transition-colors hover:bg-accent"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-white text-primary">
                    <ItemIcon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed border-border bg-white/55 px-5 text-center">
            <div className="text-primary">{itemFallback.icon}</div>
            <h3 className="mt-3 text-base font-bold text-foreground">
              {itemFallback.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {itemFallback.description}
            </p>
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-wrap justify-between gap-4">
        <DashboardActionLink action={createAction} variant="primary" />
        <DashboardActionLink action={viewAction} variant="secondary" />
      </div>
    </Card>
  );
}

export function DashboardSummaryCardSkeleton() {
  return (
    <Card className="min-h-[536px] p-7">
      <div className="flex items-center gap-5 border-b pb-5">
        <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-44 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-7 space-y-4">
        <div className="h-5 w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-9 space-y-5 border-b pb-7">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-7 flex justify-between gap-4">
        <div className="h-14 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-14 w-36 animate-pulse rounded-md bg-muted" />
      </div>
    </Card>
  );
}
