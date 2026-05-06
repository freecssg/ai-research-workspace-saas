import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center px-8 py-14 text-center">
      {icon ? <div className="mb-4 text-primary">{icon}</div> : null}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
