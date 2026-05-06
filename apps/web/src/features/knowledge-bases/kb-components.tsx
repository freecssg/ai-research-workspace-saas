import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  Bot,
  ChevronDown,
  Database,
  FileText,
  Folder,
  Grid2X2,
  MessageCircle,
  Network,
  Plus,
  ScrollText,
  SendHorizonal,
  Tags,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

import type { KnowledgeBaseRead } from "./kb-api";
import { generatedArticle, generatedWikiSections } from "./kb-mock-data";

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

export function compactDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function ErrorState({
  title = "Unable to load this page",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="mx-auto max-w-3xl p-8">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 leading-7 text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  );
}

export function LoadingSkeleton({ variant = "cards" }: { variant?: "cards" | "table" | "article" }) {
  if (variant === "article") {
    return (
      <div className="grid min-h-[calc(100vh-6rem)] gap-3 lg:grid-cols-[320px_340px_1fr]">
        <Card className="animate-pulse bg-muted/70" />
        <Card className="animate-pulse bg-muted/70" />
        <Card className="animate-pulse bg-muted/70" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="space-y-0">
        {Array.from({ length: variant === "table" ? 6 : 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 border-b px-7 py-7">
            <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-9 w-28 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PermissionDenied({ message }: { message: string }) {
  return (
    <EmptyState
      icon={<Archive className="h-10 w-10" />}
      title="Permission required"
      description={message}
    />
  );
}

export function KnowledgeBaseStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function KnowledgeBaseHeader({
  knowledgeBase,
  actions,
}: {
  knowledgeBase: KnowledgeBaseRead;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <KnowledgeBaseStatusBadge status={knowledgeBase.status} />
          <span className="text-sm font-medium text-muted-foreground">
            {knowledgeBase.research_domain}
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal">
          {knowledgeBase.name}
        </h1>
        {knowledgeBase.description ? (
          <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
            {knowledgeBase.description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

const contextLinks = [
  { href: "", label: "Wiki View", icon: ScrollText },
  { href: "thought-chains", label: "Graph / Thought Chains", icon: Network },
  { href: "workspaces", label: "Workspaces", icon: Grid2X2 },
  { href: "materials", label: "Source Materials", icon: FileText },
  { href: "agents", label: "AI Orchestrator", icon: Bot },
  { href: "conversations", label: "Conversations", icon: MessageCircle },
];

export function KnowledgeBaseContextNav({
  kbId,
  active,
  knowledgeBaseName,
}: {
  kbId: string;
  active: string;
  knowledgeBaseName: string;
}) {
  return (
    <aside className="w-full shrink-0 rounded-lg border bg-white p-4 shadow-soft lg:w-[318px]">
      <div className="rounded-md bg-accent px-4 py-4">
        <div className="flex items-center justify-between gap-3 text-primary">
          <div className="flex min-w-0 items-center gap-3">
            <Folder className="h-6 w-6 shrink-0" />
            <span className="truncate text-lg font-bold">Knowledge Base</span>
          </div>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 border-l-2 border-blue-100 pl-5">
        <div className="flex items-center gap-3 font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="truncate">{knowledgeBaseName}</span>
        </div>
        <div className="mt-4 space-y-2 pl-5">
          {contextLinks.map((link) => {
            const Icon = link.icon;
            const href = `/knowledge-bases/${kbId}${link.href ? `/${link.href}` : ""}`;
            const isActive = active === link.href || (active === "wiki" && link.href === "");
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
      </div>
    </aside>
  );
}

export function KnowledgeBaseToolShell({
  kbId,
  active,
  knowledgeBase,
  children,
  searchPlaceholder = "Search Knowledge Base...",
}: {
  kbId: string;
  active: string;
  knowledgeBase: KnowledgeBaseRead;
  children: ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <AppShell searchPlaceholder={searchPlaceholder}>
      <PageContainer size="full">
        <div className="flex min-h-[calc(100vh-10rem)] gap-3">
          <KnowledgeBaseContextNav
            kbId={kbId}
            active={active}
            knowledgeBaseName={knowledgeBase.name}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

export function TableOfContents() {
  return (
    <Card className="h-full p-5">
      <h2 className="text-xl font-extrabold">Table of Contents</h2>
      <div className="mt-6 space-y-2">
        {generatedWikiSections.map((section, index) => (
          <div key={section.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-3 text-left font-semibold",
                index === 0 ? "bg-accent text-primary" : "hover:bg-accent",
              )}
            >
              {section.label}
              <ChevronDown className="h-4 w-4" />
            </button>
            {section.children.length > 0 ? (
              <div className="ml-4 mt-2 space-y-1 border-l border-border pl-6">
                {section.children.map((child, childIndex) => (
                  <div
                    key={child}
                    className={cn(
                      "rounded-md px-2 py-2 text-sm",
                      childIndex === 2 ? "text-primary" : "text-foreground",
                    )}
                  >
                    {child}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GeneratedContentArticle() {
  return (
    <Card className="h-full overflow-auto p-9">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge>{generatedArticle.badge}</Badge>
          <span className="text-sm text-muted-foreground">{generatedArticle.updatedLabel}</span>
        </div>
        <Button variant="secondary" size="sm">
          <MessageCircle className="h-4 w-4" />
          Comment
        </Button>
      </div>

      <article className="mt-7 max-w-4xl">
        <h1 className="text-4xl font-extrabold leading-tight tracking-normal">
          {generatedArticle.title}
        </h1>
        <p className="mt-7 text-xl leading-9 text-foreground">{generatedArticle.intro}</p>
        <blockquote className="mt-7 rounded-md border-l-4 border-primary bg-accent/70 px-7 py-6 text-xl italic leading-9 text-foreground">
          "{generatedArticle.quote}"
        </blockquote>
        <div className="mt-8 flex items-center justify-between border-b pb-3">
          <h2 className="text-2xl font-extrabold">{generatedArticle.sectionTitle}</h2>
          <Button variant="secondary" size="sm">
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
        </div>
        <div className="mt-5 space-y-4 text-lg leading-8">
          {generatedArticle.bullets.map((bullet) => (
            <div key={bullet} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p>{bullet}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 rounded-md border bg-accent/60 p-5">
          <div className="flex items-center gap-3 border-b pb-3">
            <Bot className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-extrabold">Agent Insight</h3>
          </div>
          <p className="mt-4 leading-7 text-foreground">{generatedArticle.insight}</p>
        </div>
      </article>
    </Card>
  );
}

export function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-base font-semibold text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="block text-sm font-medium text-destructive">{error}</span> : null}
    </label>
  );
}

export function TagPills({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-foreground"
        >
          {label}
          <Tags className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      ))}
    </div>
  );
}

export function SendButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button type="submit" disabled={disabled} className="h-12 w-12 p-0">
      <SendHorizonal className="h-5 w-5" />
    </Button>
  );
}

export function AdminCreateButton({
  href,
  children,
  isAdmin,
}: {
  href: string;
  children: ReactNode;
  isAdmin: boolean;
}) {
  if (!isAdmin) {
    return (
      <Button
        variant="secondary"
        disabled
        title="Only admins can create Knowledge Bases."
      >
        <Plus className="h-4 w-4" />
        {children}
      </Button>
    );
  }

  return (
    <Link href={href} className={buttonVariants()}>
      <Plus className="h-4 w-4" />
      {children}
    </Link>
  );
}
