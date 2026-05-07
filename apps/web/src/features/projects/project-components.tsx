import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bot,
  Database,
  FileText,
  Folder,
  GitBranch,
  MessageCircle,
  Network,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

import type {
  ProjectMemberRole,
  ProjectRead,
  ProjectType,
  WorkflowStatus,
} from "./project-api";

export function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function ProjectStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function ProjectTypeBadge({ type }: { type: ProjectType }) {
  return <Badge>{formatEnumLabel(type)}</Badge>;
}

export function ProjectRoleBadge({ role }: { role: ProjectMemberRole | "non_team" | "admin" }) {
  const tone =
    role === "leader" || role === "admin"
      ? "green"
      : role === "editor"
        ? "blue"
        : role === "viewer"
          ? "neutral"
          : "amber";

  return <Badge tone={tone}>{formatEnumLabel(role)}</Badge>;
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus | string }) {
  return <StatusBadge status={status} />;
}

export function ProjectHeader({
  project,
  actions,
  roleLabel,
}: {
  project: ProjectRead;
  actions?: ReactNode;
  roleLabel?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          <ProjectTypeBadge type={project.project_type} />
          {roleLabel}
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal">{project.name}</h1>
        <p className="mt-3 max-w-4xl text-lg leading-8 text-muted-foreground">
          {project.output_objective}
        </p>
        {project.description ? (
          <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">{project.description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

const projectLinks = [
  { href: "", label: "Overview", icon: Folder },
  { href: "sources", label: "Sources", icon: Database },
  { href: "workflow", label: "Workflow", icon: Network },
  { href: "outputs", label: "Outputs", icon: FileText },
  { href: "team", label: "Team", icon: Users },
  { href: "conversations", label: "Conversations", icon: MessageCircle },
  { href: "tasks", label: "Tasks", icon: GitBranch },
];

export function ProjectContextNav({
  project,
  active,
}: {
  project: ProjectRead;
  active: string;
}) {
  return (
    <aside className="w-full shrink-0 rounded-lg border bg-white p-4 shadow-soft lg:w-[318px]">
      <div className="rounded-md bg-accent px-4 py-4">
        <div className="flex items-center gap-3 text-primary">
          <Folder className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">Project</p>
            <p className="truncate text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {projectLinks.map((link) => {
          const Icon = link.icon;
          const href = `/projects/${project.id}${link.href ? `/${link.href}` : ""}`;
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
      </div>
    </aside>
  );
}

export function ProjectShell({
  project,
  active,
  children,
}: {
  project: ProjectRead;
  active: string;
  children: ReactNode;
}) {
  return (
    <AppShell searchPlaceholder="Search papers, workspaces, or projects">
      <PageContainer size="full">
        <div className="flex min-h-[calc(100vh-10rem)] gap-4">
          <ProjectContextNav project={project} active={active} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

export function ProjectMetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <p className="text-3xl font-extrabold">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
    </Card>
  );
}

export function WorkflowNode({
  title,
  subtitle,
  body,
  icon,
  className,
}: {
  title: string;
  subtitle: string;
  body: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-80 rounded-lg border bg-white p-6 shadow-soft", className)}>
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon ?? <Bot className="h-5 w-5" />}</span>
          <h3 className="text-xl font-extrabold">{title}</h3>
        </div>
      </div>
      <div className="pt-4">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-2 text-lg">{body}</p>
      </div>
    </div>
  );
}

export function ReadOnlyNotice({ canEdit }: { canEdit: boolean }) {
  if (canEdit) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      You can read this project, but editing is limited to project leaders and editors.
    </div>
  );
}
