import type { ReactNode } from "react";
import { BrainCircuit, GitBranch, ListChecks } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type SignalItem = {
  id: string;
  title: string;
  meta: string;
  status?: string;
  progress?: number;
};

type DashboardSignalsProps = {
  tasks: SignalItem[];
  thoughtChains: SignalItem[];
  taskError?: string;
  thoughtChainError?: string;
};

function SignalPanel({
  title,
  description,
  icon,
  items,
  error,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  items: SignalItem[];
  error?: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
            {icon}
          </span>
          <div>
            <h2 className="text-xl font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
          {error}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-5 space-y-3">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
                {item.status ? <StatusBadge status={item.status} /> : null}
              </div>
              {typeof item.progress === "number" ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className={cn(
                      "h-full rounded-full bg-primary",
                      item.status === "failed" && "bg-destructive",
                    )}
                    style={{ width: `${Math.min(Math.max(item.progress, 0), 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-border bg-white/55 px-6 py-10 text-center">
          <GitBranch className="h-8 w-8 text-primary" />
          <h3 className="mt-3 text-lg font-bold text-foreground">{emptyTitle}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      )}
    </Card>
  );
}

export function DashboardSignals({
  tasks,
  thoughtChains,
  taskError,
  thoughtChainError,
}: DashboardSignalsProps) {
  return (
    <section className="mt-16 grid gap-8 xl:grid-cols-2">
      <SignalPanel
        title="Recent AI Activity"
        description="Task records for analysis, indexing, and project workflows."
        icon={<ListChecks className="h-6 w-6" />}
        items={tasks}
        error={taskError}
        emptyTitle="No AI tasks yet"
        emptyDescription="Source analysis, wiki builds, RAG indexing, graph builds, and workflow runs will appear here."
      />
      <SignalPanel
        title="Recent Thought Chains"
        description="Reasoning paths from user and AI research discussions."
        icon={<BrainCircuit className="h-6 w-6" />}
        items={thoughtChains}
        error={thoughtChainError}
        emptyTitle="No thought chains yet"
        emptyDescription="Thought Chains are created through AI discussions as research questions, theory paths, and gap analyses emerge."
      />
    </section>
  );
}
