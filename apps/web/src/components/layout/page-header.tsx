import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-10 flex items-end justify-between gap-6", className)}>
      <div>
        <h1 className="text-5xl font-extrabold tracking-normal text-foreground">{title}</h1>
        {description ? (
          <p className="mt-3 text-xl leading-8 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
