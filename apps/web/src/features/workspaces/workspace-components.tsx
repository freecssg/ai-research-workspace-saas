import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  Bot,
  ChevronDown,
  Database,
  FileText,
  Folder,
  GitBranch,
  MessageCircle,
  Network,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

import type { KnowledgeBaseRead, WorkspaceRead } from "@/features/knowledge-bases/kb-api";
import { workspaceSynthesis } from "./workspace-mock-data";

const workspaceLinks = [
  { href: "", label: "Overview", icon: FileText },
  { href: "materials", label: "Data Sources", icon: Database },
  { href: "agents", label: "AI Orchestrator", icon: Bot },
  { href: "thought-chains", label: "Thought Chains", icon: GitBranch },
  { href: "conversations", label: "Conversations", icon: MessageCircle },
  { href: "graph", label: "Graph", icon: Network },
];

export function WorkspaceStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function WorkspaceHeader({
  workspace,
  knowledgeBase,
  actions,
}: {
  workspace: WorkspaceRead;
  knowledgeBase?: KnowledgeBaseRead;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <WorkspaceStatusBadge status={workspace.status} />
          <Badge tone="neutral">{workspace.research_topic}</Badge>
          {knowledgeBase ? <Badge>{knowledgeBase.name}</Badge> : null}
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal">{workspace.name}</h1>
        {workspace.description ? (
          <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
            {workspace.description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function WorkspaceContextNav({
  workspace,
  knowledgeBase,
  active,
}: {
  workspace: WorkspaceRead;
  knowledgeBase?: KnowledgeBaseRead;
  active: string;
}) {
  return (
    <aside className="w-full shrink-0 rounded-lg border bg-white p-4 shadow-soft lg:w-[318px]">
      <div className="rounded-md px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">
                {knowledgeBase?.name ?? "Knowledge Base"}
              </p>
              <p className="truncate text-lg font-bold">{workspace.name}</p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-4 rounded-md bg-accent px-4 py-4">
        <div className="flex items-center justify-between gap-3 text-primary">
          <div className="flex min-w-0 items-center gap-3">
            <Folder className="h-6 w-6 shrink-0" />
            <span className="truncate text-lg font-bold">{workspace.name}</span>
          </div>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-2 border-l-2 border-blue-100 pl-5">
        {workspaceLinks.map((link) => {
          const Icon = link.icon;
          const href = `/workspaces/${workspace.id}${link.href ? `/${link.href}` : ""}`;
          const isActive = active === link.href || (active === "overview" && link.href === "");
          return (
            <Link
              key={link.label}
              href={href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary",
                isActive && "bg-accent text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
        <div className="border-t pt-4">
          <span className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground">
            <Archive className="h-4 w-4" />
            Archive
          </span>
        </div>
      </div>
    </aside>
  );
}

export function WorkspaceShell({
  workspace,
  knowledgeBase,
  active,
  children,
  searchPlaceholder = "Search workspace...",
}: {
  workspace: WorkspaceRead;
  knowledgeBase?: KnowledgeBaseRead;
  active: string;
  children: ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <AppShell searchPlaceholder={searchPlaceholder}>
      <PageContainer size="full">
        <div className="flex min-h-[calc(100vh-10rem)] gap-4">
          <WorkspaceContextNav
            workspace={workspace}
            knowledgeBase={knowledgeBase}
            active={active}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

export function WorkspaceSynthesisArticle() {
  return (
    <Card className="min-h-[calc(100vh-10rem)] p-10">
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <FileText className="h-5 w-5" />
        {workspaceSynthesis.label}
      </div>
      <h1 className="mt-8 text-5xl font-extrabold tracking-normal">
        {workspaceSynthesis.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{workspaceSynthesis.subtitle}</p>
      <div className="mt-8 border-t pt-8">
        {workspaceSynthesis.sections.map((section) => (
          <section key={section.title} className="mb-10">
            <h2 className="flex items-center gap-4 text-3xl font-extrabold">
              <span className="text-primary">
                {section.icon === "flask" ? (
                  <Database className="h-7 w-7" />
                ) : (
                  <Network className="h-7 w-7" />
                )}
              </span>
              {section.title}
            </h2>
            <p className="mt-5 text-xl leading-9 text-foreground">{section.body}</p>
            {"quote" in section && section.quote ? (
              <blockquote className="mt-6 rounded-md border-l-4 border-primary bg-accent/70 px-7 py-6 text-xl italic leading-9">
                &quot;{section.quote}&quot;
              </blockquote>
            ) : null}
            {"bullets" in section && section.bullets ? (
              <div className="mt-5 space-y-3">
                {section.bullets.map((bullet) => (
                  <div key={bullet} className="flex gap-3 text-lg leading-8">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p>{bullet}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </Card>
  );
}

export function AgentRunCard({
  name,
  description,
  model,
  disabled,
}: {
  name: string;
  description: string;
  model: string;
  disabled?: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-600 text-white">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold">{name}</h3>
            <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button disabled={disabled} title="Real agent execution is not implemented in Module 1.">
          Run
        </Button>
      </div>
      <div className="mt-5 flex gap-2">
        <Badge>{model}</Badge>
        <StatusBadge status="ready" />
      </div>
    </Card>
  );
}
