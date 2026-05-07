"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Filter,
  Folder,
  GitBranch,
  Layers3,
  LogIn,
  MessageCircle,
  Network,
  Plus,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError } from "@/lib/api-client";
import {
  clearAuthSession,
  getStoredAccessToken,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import {
  addConversationMessage,
  createKnowledgeBase,
  createKnowledgeBaseAgent,
  createKnowledgeBaseConversation,
  createKnowledgeBaseMaterial,
  createKnowledgeBaseThoughtChain,
  deleteAgent,
  deleteKnowledgeBase,
  deleteSourceMaterial,
  deleteThoughtChain,
  getCurrentUser,
  getKnowledgeBase,
  listKnowledgeBaseAgents,
  listKnowledgeBaseMaterials,
  listKnowledgeBases,
  listKnowledgeBaseThoughtChains,
  listKnowledgeBaseWorkspaces,
  type AIAnalysisAgentConfigRead,
  type ConversationMessageRead,
  type ConversationRead,
  type KnowledgeBaseRead,
  type SourceMaterialRead,
  type ThoughtChainRead,
} from "./kb-api";
import {
  AdminCreateButton,
  ErrorState,
  FormField,
  formatDate,
  formatEnumLabel,
  GeneratedContentArticle,
  KnowledgeBaseHeader,
  KnowledgeBaseStatusBadge,
  KnowledgeBaseToolShell,
  LoadingSkeleton,
  PermissionDenied,
  SendButton,
  TableOfContents,
  TagPills,
} from "./kb-components";
import { contextualNotes, graphThoughtChain } from "./kb-mock-data";

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

const sourceKinds: SourceMaterialRead["source_kind"][] = [
  "paper",
  "dataset",
  "note",
  "transcript",
  "report",
  "webpage",
  "experiment_result",
  "other",
];

const agentTypes: AIAnalysisAgentConfigRead["agent_type"][] = [
  "paper_analysis",
  "dataset_analysis",
  "method_extraction",
  "theory_mapping",
  "citation_analysis",
  "trend_analysis",
  "rag_indexing",
  "graph_building",
  "custom",
];

const chainTypes: ThoughtChainRead["chain_type"][] = [
  "theory_path",
  "method_relation",
  "concept_relation",
  "research_gap",
  "research_question",
  "argument_structure",
  "data_theory_mapping",
  "custom",
];

function requireAuth(router: ReturnType<typeof useRouter>) {
  if (!getStoredAccessToken()) {
    router.replace("/login");
    return false;
  }

  return true;
}

function handlePageError(error: unknown, router: ReturnType<typeof useRouter>, fallback: string) {
  if (error instanceof ApiClientError && error.status === 401) {
    clearAuthSession();
    router.replace("/login");
    return null;
  }

  return error instanceof Error ? error.message : fallback;
}

function useProtectedLoader<T>(
  loader: () => Promise<T>,
  fallbackMessage: string,
): [LoadState<T>, () => void] {
  const router = useRouter();
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  const load = useCallback(() => {
    if (!requireAuth(router)) {
      return;
    }

    setState({ status: "loading" });
    void loader()
      .then((data) => setState({ status: "ready", data }))
      .catch((error: unknown) => {
        const message = handlePageError(error, router, fallbackMessage);
        if (message) {
          setState({ status: "error", message });
        }
      });
  }, [fallbackMessage, loader, router]);

  useEffect(() => {
    load();
  }, [load]);

  return [state, load];
}

function statusProgress(status: string) {
  if (status === "ready") {
    return 100;
  }
  if (status === "building" || status === "analyzing" || status === "processing") {
    return 58;
  }
  if (status === "failed") {
    return 8;
  }
  if (status === "archived") {
    return 100;
  }
  return 20;
}

function fileSizeLabel(size: number | null) {
  if (!size) {
    return "No file";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function compactId(id: string) {
  return id.slice(0, 8);
}

function safeSummary(content: Record<string, unknown>) {
  const summary = content.summary;
  if (typeof summary === "string") {
    return summary;
  }

  const steps = content.steps;
  if (Array.isArray(steps)) {
    return steps.slice(0, 3).map(String).join(" -> ");
  }

  const question = content.question;
  if (typeof question === "string") {
    return question;
  }

  return JSON.stringify(content).slice(0, 160);
}

function SectionScaffold({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <AppShell>
      <PageContainer className="pt-4">
        <PageHeader title={title} description={description} actions={actions} />
        {children}
      </PageContainer>
    </AppShell>
  );
}

function SmallLinkButton({
  href,
  label,
  icon,
  tone = "default",
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone === "default" && "border-border text-primary hover:bg-accent",
        tone === "danger" && "border-red-100 text-destructive hover:bg-red-50",
      )}
    >
      {icon}
    </Link>
  );
}

export function KnowledgeBaseListClient() {
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [currentUser, knowledgeBases] = await Promise.all([
      getCurrentUser(),
      listKnowledgeBases(),
    ]);

    const rows = await Promise.all(
      knowledgeBases.map(async (knowledgeBase) => {
        const [workspaceResult, materialResult] = await Promise.allSettled([
          listKnowledgeBaseWorkspaces(knowledgeBase.id),
          listKnowledgeBaseMaterials(knowledgeBase.id),
        ]);

        return {
          knowledgeBase,
          workspaces:
            workspaceResult.status === "fulfilled" ? workspaceResult.value : [],
          materials: materialResult.status === "fulfilled" ? materialResult.value : [],
        };
      }),
    );

    return { currentUser, rows };
  }, []);

  const [state, reload] = useProtectedLoader(
    loader,
    "Knowledge Bases could not be loaded.",
  );

  const filteredRows = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }

    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
      return state.data.rows;
    }

    return state.data.rows.filter(({ knowledgeBase }) =>
      [knowledgeBase.name, knowledgeBase.research_domain, knowledgeBase.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery),
    );
  }, [query, state]);

  const handleDelete = async (knowledgeBase: KnowledgeBaseRead) => {
    if (!window.confirm(`Delete ${knowledgeBase.name}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(knowledgeBase.id);
    try {
      await deleteKnowledgeBase(knowledgeBase.id);
      reload();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SectionScaffold
      title="Knowledge Bases"
      description="Manage and access your aggregated research corpora."
      actions={
        <>
          <div className="relative hidden w-72 md:block">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter Knowledge Bases..."
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button variant="secondary">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <AdminCreateButton
            href="/knowledge-bases/new"
            isAdmin={state.status === "ready" && state.data.currentUser.role === "admin"}
          >
            Create KB
          </AdminCreateButton>
        </>
      }
    >
      {state.status === "loading" ? <LoadingSkeleton variant="table" /> : null}

      {state.status === "error" ? (
        <ErrorState message={state.message} onRetry={reload} />
      ) : null}

      {state.status === "ready" && filteredRows.length === 0 ? (
        <EmptyState
          icon={<Database className="h-10 w-10" />}
          title="No Knowledge Bases found"
          description="Admins can create a lab knowledge foundation for a research domain."
          action={
            state.data.currentUser.role === "admin" ? (
              <Link href="/knowledge-bases/new" className={buttonVariants()}>
                <Plus className="h-4 w-4" />
                Create Knowledge Base
              </Link>
            ) : null
          }
        />
      ) : null}

      {state.status === "ready" && filteredRows.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Research Domain</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Create Date</TableHead>
                <TableHead>Modify Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map(({ knowledgeBase, workspaces, materials }) => {
                const progress = statusProgress(knowledgeBase.status);
                return (
                  <TableRow key={knowledgeBase.id}>
                    <TableCell>
                      <div className="flex items-center gap-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                          <Folder className="h-6 w-6" />
                        </span>
                        <div>
                          <Link
                            href={`/knowledge-bases/${knowledgeBase.id}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {knowledgeBase.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ID: KB-{compactId(knowledgeBase.id)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{knowledgeBase.research_domain}</TableCell>
                    <TableCell>Lab user {compactId(knowledgeBase.created_by_id)}</TableCell>
                    <TableCell>{formatDate(knowledgeBase.created_at)}</TableCell>
                    <TableCell>{formatDate(knowledgeBase.updated_at)}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <KnowledgeBaseStatusBadge status={knowledgeBase.status} />
                          <span className="text-xs text-muted-foreground">
                            {workspaces.length} workspaces, {materials.length} sources
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBar value={progress} className="w-32" />
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <SmallLinkButton
                          href={`/knowledge-bases/${knowledgeBase.id}`}
                          label="Open Knowledge Base"
                          icon={<LogIn className="h-5 w-5" />}
                        />
                        <SmallLinkButton
                          href={`/knowledge-bases/${knowledgeBase.id}/materials`}
                          label="Source Materials"
                          icon={<Database className="h-5 w-5" />}
                        />
                        <SmallLinkButton
                          href={`/knowledge-bases/${knowledgeBase.id}/thought-chains`}
                          label="Thought Chains"
                          icon={<Network className="h-5 w-5" />}
                        />
                        {state.data.currentUser.role === "admin" ? (
                          <IconButton
                            icon={<Trash2 className="h-5 w-5" />}
                            label="Delete Knowledge Base"
                            tone="danger"
                            disabled={deletingId === knowledgeBase.id}
                            onClick={() => void handleDelete(knowledgeBase)}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-7 py-5 text-sm text-muted-foreground">
            <span>
              Showing 1 to {filteredRows.length} of {state.data.rows.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>
                1
              </Button>
              <Button variant="ghost" size="sm" disabled>
                2
              </Button>
              <Button variant="ghost" size="sm" disabled>
                3
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </SectionScaffold>
  );
}

export function KnowledgeBaseNewClient() {
  const router = useRouter();
  const [userState, reloadUser] = useProtectedLoader(
    getCurrentUser,
    "Unable to verify your account permissions.",
  );
  const [name, setName] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [description, setDescription] = useState("");
  const [architectureMode, setArchitectureMode] = useState<"llm_wiki" | "rag">("rag");
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState(["Q3 2024", "Meta-Analysis"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = {
    name: name.trim() ? null : "Knowledge Base title is required.",
    researchDomain: researchDomain.trim() ? null : "Research subject area is required.",
  };

  const isValid = !validation.name && !validation.researchDomain;

  const addLabel = () => {
    const nextLabel = labelInput.trim();
    if (!nextLabel || labels.includes(nextLabel)) {
      return;
    }
    setLabels((current) => [...current, nextLabel]);
    setLabelInput("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createKnowledgeBase({
        name: name.trim(),
        research_domain: researchDomain.trim(),
        description: description.trim() || null,
        status: "draft",
      });
      router.push(`/knowledge-bases/${created.id}`);
    } catch (submitError) {
      const message = handlePageError(
        submitError,
        router,
        "Knowledge Base could not be created.",
      );
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (userState.status === "loading") {
    return (
      <AppShell>
        <PageContainer size="default">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (userState.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={userState.message} onRetry={reloadUser} />
        </PageContainer>
      </AppShell>
    );
  }

  if (userState.data.role !== "admin") {
    return (
      <AppShell>
        <PageContainer size="default">
          <PermissionDenied message="Only admins can create Knowledge Bases for the lab." />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer size="default" className="pt-4">
        <Card className="mx-auto max-w-5xl p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-primary">
              <Network className="h-14 w-14" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-normal">
              Create a new Knowledge Base
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Establish a new repository for your research artifacts.
            </p>
          </div>

          <form className="mt-10 space-y-7" onSubmit={submit}>
            <div className="grid gap-7 md:grid-cols-2">
              <FormField label="Knowledge Base Title" required error={validation.name ?? undefined}>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Cognitive Psychology"
                />
              </FormField>
              <FormField
                label="Research Subject Area"
                required
                error={validation.researchDomain ?? undefined}
              >
                <Input
                  value={researchDomain}
                  onChange={(event) => setResearchDomain(event.target.value)}
                  placeholder="e.g., Neuroscience"
                />
              </FormField>
            </div>

            <div>
              <p className="mb-3 text-base font-semibold">
                Architecture Type <span className="text-destructive">*</span>
              </p>
              <div className="grid gap-7 md:grid-cols-2">
                {[
                  { key: "llm_wiki" as const, label: "LLM Wiki", icon: FileText },
                  { key: "rag" as const, label: "RAG", icon: Database },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = architectureMode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setArchitectureMode(item.key)}
                      className={cn(
                        "flex h-36 flex-col items-center justify-center gap-4 rounded-md border bg-card text-xl font-semibold transition-colors",
                        active
                          ? "border-primary bg-accent/60 text-primary"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      <Icon className="h-9 w-9" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This selection is UI planning metadata only. The current backend stores the
                Knowledge Base fields defined in the corrected domain model.
              </p>
            </div>

            <FormField label="Description / Scope">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Briefly describe the purpose and scope of this knowledge base..."
              />
            </FormField>

            <div className="space-y-3">
              <p className="text-base font-semibold">Classification Labels</p>
              <TagPills labels={labels} />
              <div className="relative">
                <Input
                  value={labelInput}
                  onChange={(event) => setLabelInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addLabel();
                    }
                  }}
                  placeholder="Add a new label and press Enter..."
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  onClick={addLabel}
                  aria-label="Add label"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end gap-4 border-t pt-7">
              <Link href="/knowledge-bases" className={buttonVariants({ variant: "secondary" })}>
                Cancel
              </Link>
              <Button type="submit" disabled={!isValid || submitting}>
                {submitting ? "Creating..." : "Next to Workspace"}
                <LogIn className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </PageContainer>
    </AppShell>
  );
}

function useKnowledgeBaseBundle(kbId: string) {
  const loader = useCallback(async () => {
    const [knowledgeBase, workspaces, materials, agents, thoughtChains] =
      await Promise.all([
        getKnowledgeBase(kbId),
        listKnowledgeBaseWorkspaces(kbId).catch(() => []),
        listKnowledgeBaseMaterials(kbId).catch(() => []),
        listKnowledgeBaseAgents(kbId).catch(() => []),
        listKnowledgeBaseThoughtChains(kbId).catch(() => []),
      ]);

    return { knowledgeBase, workspaces, materials, agents, thoughtChains };
  }, [kbId]);

  return useProtectedLoader(loader, "Knowledge Base details could not be loaded.");
}

export function KnowledgeBaseDetailClient({ kbId }: { kbId: string }) {
  const [state, reload] = useKnowledgeBaseBundle(kbId);

  if (state.status === "loading") {
    return (
      <AppShell searchPlaceholder="Search Knowledge Base...">
        <PageContainer size="full">
          <LoadingSkeleton variant="article" />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell searchPlaceholder="Search Knowledge Base...">
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const { knowledgeBase, workspaces, materials, agents, thoughtChains } = state.data;

  return (
    <KnowledgeBaseToolShell kbId={kbId} active="wiki" knowledgeBase={knowledgeBase}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/knowledge-bases/${kbId}`}
          className={buttonVariants({ variant: "secondary" })}
        >
          <FileText className="h-4 w-4" />
          Wiki View
        </Link>
        <Link
          href={`/knowledge-bases/${kbId}/graph`}
          className={buttonVariants({ variant: "secondary" })}
        >
          <Network className="h-4 w-4" />
          Graph View
        </Link>
      </div>
      <div className="grid min-h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-lg border bg-white shadow-soft xl:grid-cols-[340px_1fr]">
        <div className="border-r p-0">
          <TableOfContents />
        </div>
        <div className="min-w-0">
          <div className="border-b px-8 py-5">
            <KnowledgeBaseHeader
              knowledgeBase={knowledgeBase}
              actions={
                <Button variant="secondary" size="sm">
                  <MessageCircle className="h-4 w-4" />
                  Comment
                </Button>
              }
            />
            <div className="grid gap-3 sm:grid-cols-4">
              <Badge tone="blue">{workspaces.length} workspaces</Badge>
              <Badge tone="green">{materials.length} source materials</Badge>
              <Badge tone="amber">{agents.length} analysis agents</Badge>
              <Badge tone="neutral">{thoughtChains.length} thought chains</Badge>
            </div>
          </div>
          <GeneratedContentArticle />
        </div>
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseGraphClient({ kbId }: { kbId: string }) {
  const [state, reload] = useKnowledgeBaseBundle(kbId);

  if (state.status === "loading") {
    return (
      <AppShell searchPlaceholder="Search Knowledge Base...">
        <PageContainer size="full">
          <LoadingSkeleton variant="article" />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell searchPlaceholder="Search Knowledge Base...">
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const { knowledgeBase } = state.data;

  return (
    <KnowledgeBaseToolShell kbId={kbId} active="thought-chains" knowledgeBase={knowledgeBase}>
      <div className="grid min-h-[calc(100vh-10rem)] gap-4 xl:grid-cols-[1fr_430px]">
        <Card className="relative overflow-hidden border bg-white p-6">
          <div className="absolute left-6 top-6 z-10 flex gap-3">
            <Link
              href={`/knowledge-bases/${kbId}`}
              className={buttonVariants({ variant: "secondary" })}
            >
              <FileText className="h-4 w-4" />
              Wiki View
            </Link>
            <Link
              href={`/knowledge-bases/${kbId}/graph`}
              className={buttonVariants()}
            >
              <Network className="h-4 w-4" />
              Graph View
            </Link>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,94,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto mt-48 h-[360px] max-w-2xl">
            <div className="absolute left-4 top-24 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_9px_rgba(0,94,255,0.15)]" />
            <div className="absolute right-28 top-8 h-3 w-3 rounded-full bg-muted-foreground shadow-[0_0_0_8px_rgba(15,35,77,0.12)]" />
            <div className="absolute left-20 top-36 w-80 rounded-lg border bg-white p-7 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-extrabold">{graphThoughtChain.nodeTitle}</h2>
                <LogIn className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-lg leading-8 text-muted-foreground">
                {graphThoughtChain.nodeDescription}
              </p>
              <div className="mt-4 flex gap-2">
                {graphThoughtChain.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Network className="h-4 w-4" />
                Thought Chain
              </div>
              <span className="text-sm text-muted-foreground">2/5</span>
            </div>
            <h2 className="text-xl font-semibold leading-8">
              {graphThoughtChain.question}
            </h2>
            <div className="mt-6 space-y-4 border-t pt-4">
              {graphThoughtChain.messages.map((message) => (
                <div
                  key={message.content}
                  className={cn(
                    "rounded-md border p-4 leading-7",
                    message.sender === "assistant"
                      ? "bg-accent/60"
                      : "ml-8 bg-cyan-50 text-foreground",
                  )}
                >
                  <span className="mb-2 block text-xs font-bold uppercase text-primary">
                    {message.sender}
                  </span>
                  {message.content}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Ask about this thread..." />
              <Button className="h-12 w-12 p-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Contextual Notes</h3>
              <StatusBadge status="ready" />
            </div>
            <div className="space-y-3">
              {contextualNotes.map((note) => (
                <div key={note.title} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold">{note.title}</h4>
                    <Badge tone={note.tone}>{note.kind}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </KnowledgeBaseToolShell>
  );
}

function KbSubpageLoading() {
  return (
    <AppShell searchPlaceholder="Search Knowledge Base...">
      <PageContainer size="full">
        <LoadingSkeleton />
      </PageContainer>
    </AppShell>
  );
}

function KbSubpageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <AppShell searchPlaceholder="Search Knowledge Base...">
      <PageContainer size="default">
        <ErrorState message={message} onRetry={onRetry} />
      </PageContainer>
    </AppShell>
  );
}

export function KnowledgeBaseMaterialsClient({ kbId }: { kbId: string }) {
  const [uploadTitle, setUploadTitle] = useState("");
  const [sourceKind, setSourceKind] = useState<SourceMaterialRead["source_kind"]>("paper");
  const [visibility, setVisibility] = useState<SourceMaterialRead["visibility"]>("lab_internal");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loader = useCallback(async () => {
    const [knowledgeBase, materials] = await Promise.all([
      getKnowledgeBase(kbId),
      listKnowledgeBaseMaterials(kbId),
    ]);
    return { knowledgeBase, materials };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(
    loader,
    "Source materials could not be loaded.",
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", uploadTitle.trim() || file?.name || "Untitled source");
      formData.append("source_kind", sourceKind);
      formData.append("visibility", visibility);
      if (file) {
        formData.append("upload", file);
      }
      await createKnowledgeBaseMaterial(kbId, formData);
      setUploadTitle("");
      setFile(null);
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Source material could not be added.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeMaterial = async (materialId: string) => {
    if (!window.confirm("Delete this source material record?")) {
      return;
    }
    await deleteSourceMaterial(materialId);
    reload();
  };

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  return (
    <KnowledgeBaseToolShell
      kbId={kbId}
      active="materials"
      knowledgeBase={state.data.knowledgeBase}
      searchPlaceholder="Search papers, workspaces, or projects"
    >
      <div className="space-y-6">
        <KnowledgeBaseHeader
          knowledgeBase={state.data.knowledgeBase}
          actions={<StatusBadge status="uploaded" />}
        />
        <Card className="p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">Source Materials</h2>
              <p className="text-muted-foreground">
                Upload or register raw research sources. Analysis happens later through tasks.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="rounded-md border border-dashed border-blue-200 p-8 text-center">
              <UploadCloud className="mx-auto h-14 w-14 text-primary" />
              <p className="mt-4 text-lg font-semibold">Drag and drop files here</p>
              <p className="text-muted-foreground">or browse local files</p>
              <Input
                type="file"
                className="mx-auto mt-5 max-w-md"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFile(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
              <Input
                value={uploadTitle}
                onChange={(event) => setUploadTitle(event.target.value)}
                placeholder="Optional material title"
              />
              <Select
                value={sourceKind}
                onChange={(event) =>
                  setSourceKind(event.target.value as SourceMaterialRead["source_kind"])
                }
              >
                {sourceKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {formatEnumLabel(kind)}
                  </option>
                ))}
              </Select>
              <Select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as SourceMaterialRead["visibility"])
                }
              >
                <option value="lab_internal">Lab Internal</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Select>
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Material"}
              </Button>
            </div>
          </form>
        </Card>

        {state.data.materials.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No source materials yet"
            description="Add papers, datasets, notes, reports, or webpages for later analysis."
          />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.data.materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="font-semibold">{material.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {material.original_filename ?? material.source_url ?? "Manual source"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{formatEnumLabel(material.source_kind)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone="neutral">{formatEnumLabel(material.visibility)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={material.processing_status} />
                    </TableCell>
                    <TableCell>{fileSizeLabel(material.file_size)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <IconButton
                          icon={<Trash2 className="h-5 w-5" />}
                          label="Delete material"
                          tone="danger"
                          onClick={() => void removeMaterial(material.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseAgentsClient({ kbId }: { kbId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agentType, setAgentType] =
    useState<AIAnalysisAgentConfigRead["agent_type"]>("paper_analysis");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [currentUser, knowledgeBase, agents] = await Promise.all([
      getCurrentUser(),
      getKnowledgeBase(kbId),
      listKnowledgeBaseAgents(kbId),
    ]);
    return { currentUser, knowledgeBase, agents };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "AI agents could not be loaded.");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createKnowledgeBaseAgent(kbId, {
        name: name.trim(),
        agent_type: agentType,
        description: description.trim() || null,
        is_active: true,
      });
      setName("");
      setDescription("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "AI agent could not be saved.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeAgent = async (agentId: string) => {
    if (!window.confirm("Delete this AI analysis agent configuration?")) {
      return;
    }
    await deleteAgent(agentId);
    reload();
  };

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  const isAdmin = state.data.currentUser.role === "admin";

  return (
    <KnowledgeBaseToolShell kbId={kbId} active="agents" knowledgeBase={state.data.knowledgeBase}>
      <div className="space-y-6">
        <KnowledgeBaseHeader knowledgeBase={state.data.knowledgeBase} />
        <Card className="p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">AI Agent Orchestrator</h2>
              <p className="text-muted-foreground">
                Configure analysis agents. Running agents will create task records later.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Agent name, e.g. Literature Synthesizer"
                  required
                />
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the primary function of this agent..."
                />
              </div>
              <div className="space-y-4">
                <Select
                  value={agentType}
                  onChange={(event) =>
                    setAgentType(event.target.value as AIAnalysisAgentConfigRead["agent_type"])
                  }
                >
                  {agentTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatEnumLabel(type)}
                    </option>
                  ))}
                </Select>
                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={submitting || !name.trim()}>
                  {submitting ? "Saving..." : "Add AI Agent"}
                </Button>
              </div>
            </form>
          ) : (
            <PermissionDenied message="Only admins can create or update Knowledge Base agent configurations." />
          )}
        </Card>

        {state.data.agents.length === 0 ? (
          <EmptyState
            icon={<Bot className="h-10 w-10" />}
            title="No AI agents configured"
            description="Admins can define paper, dataset, theory mapping, RAG indexing, or graph building agents."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {state.data.agents.map((agent) => (
              <Card key={agent.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent text-primary">
                      <Bot className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold">{agent.name}</h3>
                      <p className="mt-2 leading-7 text-muted-foreground">
                        {agent.description ?? "No description provided."}
                      </p>
                    </div>
                  </div>
                  {isAdmin ? (
                    <IconButton
                      icon={<Trash2 className="h-5 w-5" />}
                      label="Delete agent"
                      tone="danger"
                      onClick={() => void removeAgent(agent.id)}
                    />
                  ) : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>{formatEnumLabel(agent.agent_type)}</Badge>
                  <StatusBadge status={agent.is_active ? "active" : "archived"} />
                  {agent.output_format ? <Badge tone="neutral">{agent.output_format}</Badge> : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseThoughtChainsClient({ kbId }: { kbId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chainType, setChainType] =
    useState<ThoughtChainRead["chain_type"]>("research_question");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [knowledgeBase, thoughtChains] = await Promise.all([
      getKnowledgeBase(kbId),
      listKnowledgeBaseThoughtChains(kbId),
    ]);
    return { knowledgeBase, thoughtChains };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "Thought Chains could not be loaded.");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createKnowledgeBaseThoughtChain(kbId, {
        title: title.trim(),
        description: description.trim() || null,
        chain_type: chainType,
        content: {
          summary: description.trim() || title.trim(),
          nodes: [],
          source: "frontend",
        },
      });
      setTitle("");
      setDescription("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Thought Chain could not be saved.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeChain = async (chainId: string) => {
    if (!window.confirm("Delete this Thought Chain?")) {
      return;
    }
    await deleteThoughtChain(chainId);
    reload();
  };

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  return (
    <KnowledgeBaseToolShell
      kbId={kbId}
      active="thought-chains"
      knowledgeBase={state.data.knowledgeBase}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_430px]">
        <Card className="relative min-h-[620px] overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,94,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative z-10 flex flex-wrap gap-3">
            <Link
              href={`/knowledge-bases/${kbId}`}
              className={buttonVariants({ variant: "secondary" })}
            >
              <FileText className="h-4 w-4" />
              Wiki View
            </Link>
            <Link
              href={`/knowledge-bases/${kbId}/thought-chains`}
              className={buttonVariants()}
            >
              <Network className="h-4 w-4" />
              Graph View
            </Link>
          </div>
          <div className="relative z-10 mx-auto mt-32 max-w-xl rounded-lg border bg-white p-7 shadow-soft">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-extrabold">EPR Paradox</h2>
              <LogIn className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-lg leading-8 text-muted-foreground">
              The Einstein-Podolsky-Rosen paradox is a thought experiment in quantum
              mechanics intended to expose relationships between locality, measurement,
              and hidden variables.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge>Theory</Badge>
              <Badge tone="green">1935</Badge>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-extrabold">Create Thought Chain</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Thought Chains are reasoning artifacts created through lab discussion and AI
              conversations. They are not generated wiki nodes.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Research question or reasoning path"
                required
              />
              <Select
                value={chainType}
                onChange={(event) =>
                  setChainType(event.target.value as ThoughtChainRead["chain_type"])
                }
              >
                {chainTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </option>
                ))}
              </Select>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the chain..."
              />
              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              <Button type="submit" disabled={submitting || !title.trim()} className="w-full">
                {submitting ? "Saving..." : "Save Thought Chain"}
              </Button>
            </form>
          </Card>

          {state.data.thoughtChains.length === 0 ? (
            <EmptyState
              icon={<GitBranch className="h-10 w-10" />}
              title="No Thought Chains yet"
              description="Create reasoning paths from AI discussions, research gaps, and concept relations."
            />
          ) : (
            <div className="space-y-3">
              {state.data.thoughtChains.map((chain) => (
                <Card key={chain.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{chain.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {chain.description ?? safeSummary(chain.content)}
                      </p>
                    </div>
                    <IconButton
                      icon={<Trash2 className="h-5 w-5" />}
                      label="Delete Thought Chain"
                      tone="danger"
                      onClick={() => void removeChain(chain.id)}
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge>{formatEnumLabel(chain.chain_type)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(chain.created_at)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseConversationsClient({ kbId }: { kbId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("Knowledge Base discussion");
  const [conversation, setConversation] = useState<ConversationRead | null>(null);
  const [messages, setMessages] = useState<ConversationMessageRead[]>([]);
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const knowledgeBase = await getKnowledgeBase(kbId);
    return { knowledgeBase };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "Conversation workspace could not be loaded.");

  const startConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createKnowledgeBaseConversation(kbId, title.trim());
      setConversation(created);
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Conversation could not be created.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversation || !messageText.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await addConversationMessage(conversation.id, {
        sender_type: "user",
        content: messageText.trim(),
      });
      setMessages((current) => [...current, created]);
      setMessageText("");
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Message could not be sent.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  return (
    <KnowledgeBaseToolShell
      kbId={kbId}
      active="conversations"
      knowledgeBase={state.data.knowledgeBase}
    >
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Conversations</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Discuss Knowledge Base content with AI. The backend currently supports creating a
            conversation and posting messages, but does not expose conversation lists yet.
          </p>
          <form onSubmit={startConversation} className="mt-6 space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Conversation title"
            />
            <Button type="submit" disabled={submitting || !title.trim()} className="w-full">
              <Plus className="h-4 w-4" />
              Start Conversation
            </Button>
          </form>
        </Card>

        <Card className="flex min-h-[620px] flex-col p-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-extrabold">
              {conversation?.title ?? "Knowledge Base discussion"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              AI responses are not generated in this module yet.
            </p>
          </div>
          <div className="flex-1 space-y-4 overflow-auto py-6">
            {messages.length === 0 ? (
              <EmptyState
                icon={<MessageCircle className="h-10 w-10" />}
                title="No messages yet"
                description="Create a conversation, then send your first user message."
              />
            ) : (
              messages.map((message) => (
                <div key={message.id} className="ml-auto max-w-xl rounded-md bg-cyan-50 p-4">
                  <Badge>{formatEnumLabel(message.sender_type)}</Badge>
                  <p className="mt-3 leading-7">{message.content}</p>
                </div>
              ))
            )}
          </div>
          {error ? <p className="mb-3 text-sm font-medium text-destructive">{error}</p> : null}
          <form onSubmit={sendMessage} className="flex gap-3 border-t pt-4">
            <Input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Ask about this knowledge base..."
              disabled={!conversation}
            />
            <SendButton disabled={submitting || !conversation || !messageText.trim()} />
          </form>
        </Card>
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseWorkspacesClient({ kbId }: { kbId: string }) {
  const loader = useCallback(async () => {
    const [currentUser, knowledgeBase, workspaces] = await Promise.all([
      getCurrentUser(),
      getKnowledgeBase(kbId),
      listKnowledgeBaseWorkspaces(kbId),
    ]);
    return { currentUser, knowledgeBase, workspaces };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "Workspaces could not be loaded.");

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  const isAdmin = state.data.currentUser.role === "admin";

  return (
    <KnowledgeBaseToolShell kbId={kbId} active="workspaces" knowledgeBase={state.data.knowledgeBase}>
      <div className="space-y-6">
        <KnowledgeBaseHeader
          knowledgeBase={state.data.knowledgeBase}
          actions={
            isAdmin ? (
              <Link
                href={`/knowledge-bases/${kbId}/workspaces/new`}
                className={buttonVariants()}
              >
                <Plus className="h-4 w-4" />
                New Workspace
              </Link>
            ) : (
              <Button variant="secondary" disabled title="Only admins can create Workspaces.">
                <Plus className="h-4 w-4" />
                New Workspace
              </Button>
            )
          }
        />

        {state.data.workspaces.length === 0 ? (
          <EmptyState
            icon={<Layers3 className="h-10 w-10" />}
            title="No topic Workspaces yet"
            description="Workspaces are topic-specific subsets created inside a Knowledge Base."
          />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Research Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.data.workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent text-primary">
                          <Folder className="h-6 w-6" />
                        </span>
                        <div>
                          <Link
                            href={`/workspaces/${workspace.id}`}
                            className="font-semibold hover:text-primary"
                          >
                            {workspace.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {workspace.description ?? "Topic space"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{workspace.research_topic}</TableCell>
                    <TableCell>
                      <StatusBadge status={workspace.status} />
                    </TableCell>
                    <TableCell>{formatDate(workspace.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <SmallLinkButton
                          href={`/workspaces/${workspace.id}`}
                          label="Open Workspace"
                          icon={<LogIn className="h-5 w-5" />}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </KnowledgeBaseToolShell>
  );
}

export function KnowledgeBaseWorkspaceNewPlaceholderClient({ kbId }: { kbId: string }) {
  const loader = useCallback(async () => {
    const [currentUser, knowledgeBase] = await Promise.all([getCurrentUser(), getKnowledgeBase(kbId)]);
    return { currentUser, knowledgeBase };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "Workspace setup could not be loaded.");

  if (state.status === "loading") {
    return <KbSubpageLoading />;
  }

  if (state.status === "error") {
    return <KbSubpageError message={state.message} onRetry={reload} />;
  }

  return (
    <KnowledgeBaseToolShell kbId={kbId} active="workspaces" knowledgeBase={state.data.knowledgeBase}>
      <Card className="mx-auto max-w-3xl p-8 text-center">
        {state.data.currentUser.role === "admin" ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-extrabold">Workspace creation is next</h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              This route is reserved for the dedicated Workspace creation flow. The current
              Knowledge Base task only adds the navigation placeholder required by the design.
            </p>
          </>
        ) : (
          <PermissionDenied message="Only admins can create Workspaces inside a Knowledge Base." />
        )}
        <Link
          href={`/knowledge-bases/${kbId}/workspaces`}
          className={cn(buttonVariants({ variant: "secondary" }), "mt-6")}
        >
          Back to Workspaces
        </Link>
      </Card>
    </KnowledgeBaseToolShell>
  );
}
