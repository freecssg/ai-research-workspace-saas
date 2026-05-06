"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Database,
  FileText,
  Folder,
  FolderOpen,
  Network,
  RefreshCw,
  UsersRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearAuthSession, getStoredAccessToken } from "@/lib/auth-client";
import { ApiClientError } from "@/lib/api-client";
import { dashboardMockAggregateMetrics } from "@/lib/mock-data";

import {
  type DashboardData,
  type KnowledgeBaseRead,
  type ProjectRead,
  type TaskRead,
  type ThoughtChainRead,
  type WorkspaceRead,
  fetchDashboardData,
} from "./dashboard-api";
import { DashboardSignals } from "./dashboard-signals";
import {
  DashboardSummaryCard,
  DashboardSummaryCardSkeleton,
  type DashboardRecentItem,
  type DashboardSummaryCardProps,
} from "./dashboard-summary-card";

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: DashboardData };

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function knowledgeBaseItems(items: KnowledgeBaseRead[]): DashboardRecentItem[] {
  return items.slice(0, 3).map((item) => ({
    id: item.id,
    label: item.name,
    href: `/knowledge-bases/${item.id}`,
    icon: FileText,
  }));
}

function workspaceItems(items: WorkspaceRead[]): DashboardRecentItem[] {
  return items.slice(0, 3).map((item) => ({
    id: item.id,
    label: item.name,
    href: `/workspaces/${item.id}`,
    icon: UsersRound,
  }));
}

function projectItems(items: ProjectRead[]): DashboardRecentItem[] {
  return items.slice(0, 3).map((item) => ({
    id: item.id,
    label: item.name,
    href: `/projects/${item.id}`,
    icon: Folder,
  }));
}

function taskSignals(items: TaskRead[]) {
  return items.slice(0, 4).map((item) => ({
    id: item.id,
    title: formatEnumLabel(item.task_type),
    meta: `${formatEnumLabel(item.task_scope)} task`,
    status: item.status,
    progress: item.progress,
  }));
}

function thoughtChainSignals(items: ThoughtChainRead[]) {
  return items.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title,
    meta: formatEnumLabel(item.chain_type),
  }));
}

function progressFromStatus<T extends { status: string }>(
  items: T[],
  completeStatuses: string[],
) {
  if (items.length === 0) {
    return 0;
  }

  const completeCount = items.filter((item) =>
    completeStatuses.includes(item.status),
  ).length;
  return Math.round((completeCount / items.length) * 100);
}

function buildSummaryCards(
  data: DashboardData,
): DashboardSummaryCardProps[] {
  const isAdmin = data.currentUser.role === "admin";
  const { knowledgeBases, workspaces, projects, sectionErrors } = data;

  return [
    {
      title: "Knowledge Base",
      icon: Database,
      maturityValue:
        knowledgeBases.length > 0
          ? dashboardMockAggregateMetrics.knowledgeBases.analyzedLabel
          : "0 papers analyzed",
      capacityValue:
        knowledgeBases.length > 0
          ? dashboardMockAggregateMetrics.knowledgeBases.capacityLabel
          : "0 papers",
      progress:
        knowledgeBases.length > 0
          ? dashboardMockAggregateMetrics.knowledgeBases.progress
          : progressFromStatus(knowledgeBases, ["ready"]),
      items: knowledgeBaseItems(knowledgeBases),
      sectionError: sectionErrors.knowledgeBases,
      itemFallback: {
        icon: <Database className="h-7 w-7" />,
        title: "No Knowledge Bases yet",
        description: "The lab can create a knowledge foundation for a research domain.",
      },
      createAction: isAdmin
        ? { label: "Create", href: "/knowledge-bases/new" }
        : {
            label: "Create",
            disabled: true,
            disabledReason: "Only admins can create Knowledge Bases.",
          },
      viewAction: { label: "View all", href: "/knowledge-bases" },
    },
    {
      title: "Workspaces",
      icon: Network,
      maturityValue:
        workspaces.length > 0
          ? dashboardMockAggregateMetrics.workspaces.analyzedLabel
          : "0 papers analyzed",
      capacityValue:
        workspaces.length > 0
          ? dashboardMockAggregateMetrics.workspaces.capacityLabel
          : "0 papers",
      progress:
        workspaces.length > 0
          ? dashboardMockAggregateMetrics.workspaces.progress
          : progressFromStatus(workspaces, ["ready"]),
      items: workspaceItems(workspaces),
      sectionError: sectionErrors.workspaces,
      itemFallback: {
        icon: <Network className="h-7 w-7" />,
        title: "No Workspaces yet",
        description: "Workspaces are topic spaces created inside a Knowledge Base.",
      },
      createAction: {
        label: "Create",
        href: "/knowledge-bases",
        disabledReason: "Open a Knowledge Base first to create a Workspace.",
      },
      viewAction: { label: "View all", href: "/workspaces" },
    },
    {
      title: "Projects",
      icon: FolderOpen,
      maturityValue:
        projects.length > 0
          ? dashboardMockAggregateMetrics.projects.analyzedLabel
          : "0 papers analyzed",
      capacityValue:
        projects.length > 0
          ? dashboardMockAggregateMetrics.projects.capacityLabel
          : "0 papers",
      progress:
        projects.length > 0
          ? dashboardMockAggregateMetrics.projects.progress
          : progressFromStatus(projects, ["completed"]),
      items: projectItems(projects),
      sectionError: sectionErrors.projects,
      itemFallback: {
        icon: <FolderOpen className="h-7 w-7" />,
        title: "No Projects yet",
        description: "Projects generate academic outputs from selected research sources.",
      },
      createAction: { label: "Create", href: "/projects/new" },
      viewAction: { label: "View all", href: "/projects" },
    },
  ];
}

function DashboardLoading() {
  return (
    <div className="grid gap-8 xl:grid-cols-3">
      <DashboardSummaryCardSkeleton />
      <DashboardSummaryCardSkeleton />
      <DashboardSummaryCardSkeleton />
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="mx-auto max-w-3xl p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold">Dashboard data is unavailable</h2>
          <p className="mt-2 leading-7 text-muted-foreground">{message}</p>
          <Button className="mt-6" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  const loadDashboard = useCallback(async () => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }

    setState({ status: "loading" });

    try {
      const data = await fetchDashboardData();
      setState({ status: "ready", data });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearAuthSession();
        router.replace("/login");
        return;
      }

      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The dashboard could not be loaded.",
      });
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const cards = useMemo(
    () => (state.status === "ready" ? buildSummaryCards(state.data) : []),
    [state],
  );

  return (
    <AppShell>
      <PageContainer className="pt-10">
        <PageHeader
          title="Dashboard"
          description="Overview of your research environment."
          className="mb-12"
        />

        {state.status === "loading" ? <DashboardLoading /> : null}

        {state.status === "error" ? (
          <DashboardError message={state.message} onRetry={loadDashboard} />
        ) : null}

        {state.status === "ready" ? (
          <>
            <section className="grid gap-8 xl:grid-cols-3">
              {cards.map((card) => (
                <DashboardSummaryCard key={card.title} {...card} />
              ))}
            </section>

            <DashboardSignals
              tasks={taskSignals(state.data.tasks)}
              thoughtChains={thoughtChainSignals(state.data.thoughtChains)}
              taskError={state.data.sectionErrors.tasks}
              thoughtChainError={state.data.sectionErrors.thoughtChains}
            />
          </>
        ) : null}
      </PageContainer>
    </AppShell>
  );
}
