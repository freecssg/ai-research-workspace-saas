"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  CloudUpload,
  Database,
  Filter,
  Folder,
  GitBranch,
  LogIn,
  Plus,
  Radio,
  Search,
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
import { clearAuthSession, getStoredAccessToken } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import {
  addConversationMessage,
  createKnowledgeBaseWorkspace,
  createWorkspaceAgent,
  createWorkspaceConversation,
  createWorkspaceMaterial,
  createWorkspaceThoughtChain,
  deleteAgent,
  deleteSourceMaterial,
  deleteThoughtChain,
  getCurrentUser,
  getKnowledgeBase,
  getWorkspace,
  listKnowledgeBases,
  listKnowledgeBaseWorkspaces,
  listWorkspaceAgents,
  listWorkspaceMaterials,
  listWorkspaceThoughtChains,
  type AIAnalysisAgentConfigRead,
  type ConversationMessageRead,
  type ConversationRead,
  type SourceMaterialRead,
  type ThoughtChainRead,
} from "@/features/knowledge-bases/kb-api";
import {
  ErrorState,
  FormField,
  formatDate,
  formatEnumLabel,
  LoadingSkeleton,
  PermissionDenied,
  SendButton,
} from "@/features/knowledge-bases/kb-components";

import {
  workspaceAgentCards,
  workspaceGraph,
  workspaceTemplates,
} from "./workspace-mock-data";
import {
  AgentRunCard,
  WorkspaceHeader,
  WorkspaceShell,
  WorkspaceSynthesisArticle,
} from "./workspace-components";

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
  if (status === "analyzing") {
    return 60;
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

function safeSummary(content: Record<string, unknown>) {
  const summary = content.summary;
  if (typeof summary === "string") {
    return summary;
  }
  const steps = content.steps;
  if (Array.isArray(steps)) {
    return steps.slice(0, 3).map(String).join(" -> ");
  }
  return JSON.stringify(content).slice(0, 160);
}

function SmallLinkButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
    </Link>
  );
}

export function WorkspaceListClient() {
  const [query, setQuery] = useState("");

  const loader = useCallback(async () => {
    const knowledgeBases = await listKnowledgeBases();
    const workspaceResults = await Promise.allSettled(
      knowledgeBases.map(async (knowledgeBase) => {
        const workspaces = await listKnowledgeBaseWorkspaces(knowledgeBase.id);
        return { knowledgeBase, workspaces };
      }),
    );

    const rows = workspaceResults.flatMap((result) =>
      result.status === "fulfilled"
        ? result.value.workspaces.map((workspace) => ({
            workspace,
            knowledgeBase: result.value.knowledgeBase,
          }))
        : [],
    );

    const metrics = await Promise.allSettled(
      rows.map(async ({ workspace }) => {
        const [materials, agents, thoughtChains] = await Promise.all([
          listWorkspaceMaterials(workspace.id).catch(() => []),
          listWorkspaceAgents(workspace.id).catch(() => []),
          listWorkspaceThoughtChains(workspace.id).catch(() => []),
        ]);
        return { workspaceId: workspace.id, materials, agents, thoughtChains };
      }),
    );

    const metricMap = new Map(
      metrics
        .filter((result) => result.status === "fulfilled")
        .map((result) => [result.value.workspaceId, result.value]),
    );

    return { rows, metricMap };
  }, []);

  const [state, reload] = useProtectedLoader(loader, "Workspaces could not be loaded.");

  const filteredRows = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
      return state.data.rows;
    }
    return state.data.rows.filter(({ workspace, knowledgeBase }) =>
      [
        workspace.name,
        workspace.research_topic,
        workspace.description ?? "",
        knowledgeBase.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery),
    );
  }, [query, state]);

  return (
    <AppShell>
      <PageContainer className="pt-4">
        <PageHeader
          title="Workspaces"
          description="Manage and access your active research environments."
          actions={
            <>
              <div className="relative hidden w-72 md:block">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter Workspaces..."
                  className="pl-10"
                />
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="secondary">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Link
                href="/knowledge-bases"
                className={buttonVariants()}
                title="Select a Knowledge Base before creating a Workspace."
              >
                <Plus className="h-4 w-4" />
                New Workspace
              </Link>
            </>
          }
        />

        {state.status === "loading" ? <LoadingSkeleton variant="table" /> : null}
        {state.status === "error" ? <ErrorState message={state.message} onRetry={reload} /> : null}

        {state.status === "ready" && filteredRows.length === 0 ? (
          <EmptyState
            icon={<Folder className="h-10 w-10" />}
            title="No Workspaces found"
            description="Open a Knowledge Base first, then create a topic-specific Workspace inside it."
            action={
              <Link href="/knowledge-bases" className={buttonVariants()}>
                Choose Knowledge Base
              </Link>
            }
          />
        ) : null}

        {state.status === "ready" && filteredRows.length > 0 ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Knowledge Base</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Create Date</TableHead>
                  <TableHead>Modify Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map(({ workspace, knowledgeBase }) => {
                  const metrics = state.data.metricMap.get(workspace.id);
                  const materialCount = metrics?.materials.length ?? 0;
                  const progress = statusProgress(workspace.status);
                  return (
                    <TableRow key={workspace.id}>
                      <TableCell>
                        <div className="flex items-center gap-5">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                            <Folder className="h-6 w-6" />
                          </span>
                          <div>
                            <Link
                              href={`/workspaces/${workspace.id}`}
                              className="font-semibold text-foreground hover:text-primary"
                            >
                              {workspace.name}
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {workspace.research_topic}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{knowledgeBase.name}</TableCell>
                      <TableCell>Lab user {workspace.created_by_id.slice(0, 8)}</TableCell>
                      <TableCell>{formatDate(workspace.created_at)}</TableCell>
                      <TableCell>{formatDate(workspace.updated_at)}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={workspace.status} />
                            <span className="text-xs text-muted-foreground">
                              {materialCount} source materials
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
                            href={`/workspaces/${workspace.id}`}
                            label="Open Workspace"
                            icon={<LogIn className="h-5 w-5" />}
                          />
                          <SmallLinkButton
                            href={`/workspaces/${workspace.id}/materials`}
                            label="Source Materials"
                            icon={<Database className="h-5 w-5" />}
                          />
                          <SmallLinkButton
                            href={`/workspaces/${workspace.id}/agents`}
                            label="AI Agents"
                            icon={<Bot className="h-5 w-5" />}
                          />
                          <SmallLinkButton
                            href={`/workspaces/${workspace.id}/thought-chains`}
                            label="Thought Chains"
                            icon={<GitBranch className="h-5 w-5" />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-7 py-5 text-sm text-muted-foreground">
              <span>Showing 1 to {filteredRows.length} of {state.data.rows.length} entries</span>
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
      </PageContainer>
    </AppShell>
  );
}

export function WorkspaceNewClient({ kbId }: { kbId: string }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(workspaceTemplates[0]);
  const [customMode, setCustomMode] = useState(false);
  const [name, setName] = useState(workspaceTemplates[0].name);
  const [researchTopic, setResearchTopic] = useState(workspaceTemplates[0].researchTopic);
  const [description, setDescription] = useState(workspaceTemplates[0].description);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [currentUser, knowledgeBase] = await Promise.all([getCurrentUser(), getKnowledgeBase(kbId)]);
    return { currentUser, knowledgeBase };
  }, [kbId]);

  const [state, reload] = useProtectedLoader(loader, "Workspace setup could not be loaded.");

  const selectTemplate = (template: (typeof workspaceTemplates)[number]) => {
    setSelectedTemplate(template);
    setCustomMode(false);
    setName(template.name);
    setResearchTopic(template.researchTopic);
    setDescription(template.description);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !researchTopic.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createKnowledgeBaseWorkspace(kbId, {
        name: name.trim(),
        research_topic: researchTopic.trim(),
        description: description.trim() || null,
        status: "draft",
      });
      router.push(`/workspaces/${created.id}`);
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Workspace could not be created.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer size="default">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.data.currentUser.role !== "admin") {
    return (
      <AppShell>
        <PageContainer size="default">
          <PermissionDenied message="Only admins can create Workspaces inside a Knowledge Base." />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer size="default" className="pt-4">
        <PageHeader
          title="Configure Workspaces"
          description={`Create a topic-specific Workspace inside ${state.data.knowledgeBase.name}.`}
        />

        <form onSubmit={submit} className="space-y-6">
          {workspaceTemplates.map((template) => {
            const active = selectedTemplate.key === template.key && !customMode;
            return (
              <button
                key={template.key}
                type="button"
                onClick={() => selectTemplate(template)}
                className={cn(
                  "flex w-full items-center gap-8 rounded-lg border bg-card p-8 text-left shadow-soft transition-colors hover:bg-accent/50",
                  active && "border-primary bg-accent/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl",
                    template.tone === "blue" && "bg-blue-50 text-primary",
                    template.tone === "green" && "bg-emerald-50 text-emerald-600",
                    template.tone === "amber" && "bg-amber-50 text-amber-600",
                  )}
                >
                  {template.key === "theory" ? (
                    <Database className="h-12 w-12" />
                  ) : template.key === "study" ? (
                    <Folder className="h-12 w-12" />
                  ) : (
                    <Send className="h-12 w-12" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-3xl font-extrabold">{template.name}</span>
                    <Badge tone={template.tone}>Auto-generated</Badge>
                  </span>
                  <span className="mt-3 block max-w-xl text-lg leading-8 text-muted-foreground">
                    {template.description}
                  </span>
                </span>
                <span className={buttonVariants({ variant: "secondary" })}>
                  <Database className="h-4 w-4" />
                  Configure Source
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              setName("");
              setResearchTopic("");
              setDescription("");
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-card p-8 text-center text-primary",
              customMode && "border-primary bg-accent/40",
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Plus className="h-6 w-6" />
            </span>
            <span className="mt-3 text-xl font-bold">Add Workspace</span>
            <span className="mt-2 text-sm text-muted-foreground">
              Create a custom workspace for your own research stage.
            </span>
          </button>

          <Card className="p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Workspace Name" required>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Theory"
                />
              </FormField>
              <FormField label="Research Topic" required>
                <Input
                  value={researchTopic}
                  onChange={(event) => setResearchTopic(event.target.value)}
                  placeholder="e.g., Foundational theory"
                />
              </FormField>
            </div>
            <div className="mt-5">
              <FormField label="Description">
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the Workspace scope..."
                />
              </FormField>
            </div>
          </Card>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <div className="flex items-center justify-between border-t pt-6">
            <Link
              href={`/knowledge-bases/${kbId}/workspaces`}
              className={buttonVariants({ variant: "secondary" })}
            >
              Back
            </Link>
            <Button type="submit" disabled={submitting || !name.trim() || !researchTopic.trim()}>
              {submitting ? "Creating..." : "Next to Workspace"}
              <LogIn className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </PageContainer>
    </AppShell>
  );
}

function useWorkspaceBundle(workspaceId: string) {
  const loader = useCallback(async () => {
    const workspace = await getWorkspace(workspaceId);
    const [knowledgeBase, materials, agents, thoughtChains] = await Promise.all([
      getKnowledgeBase(workspace.knowledge_base_id),
      listWorkspaceMaterials(workspaceId).catch(() => []),
      listWorkspaceAgents(workspaceId).catch(() => []),
      listWorkspaceThoughtChains(workspaceId).catch(() => []),
    ]);
    return { workspace, knowledgeBase, materials, agents, thoughtChains };
  }, [workspaceId]);

  return useProtectedLoader(loader, "Workspace details could not be loaded.");
}

export function WorkspaceDetailClient({ workspaceId }: { workspaceId: string }) {
  const [state, reload] = useWorkspaceBundle(workspaceId);

  if (state.status === "loading") {
    return (
      <AppShell searchPlaceholder="Search workspace...">
        <PageContainer size="full">
          <LoadingSkeleton variant="article" />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell searchPlaceholder="Search workspace...">
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const { workspace, knowledgeBase, agents } = state.data;
  const realCards = agents.map((agent) => ({
    name: agent.name,
    description: agent.description ?? formatEnumLabel(agent.agent_type),
    model: agent.output_format ?? formatEnumLabel(agent.agent_type),
    status: agent.is_active ? "ready" : "archived",
  }));
  const cards = realCards.length > 0 ? realCards : workspaceAgentCards;

  return (
    <WorkspaceShell workspace={workspace} knowledgeBase={knowledgeBase} active="overview">
      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <div>
          <WorkspaceHeader workspace={workspace} knowledgeBase={knowledgeBase} />
          <WorkspaceSynthesisArticle />
        </div>
        <Card className="p-6">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent text-primary">
              <Bot className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">AI Agent Orchestrator</h2>
              <p className="text-muted-foreground">Active workspace tools</p>
            </div>
          </div>
          <div className="space-y-5">
            {cards.map((agent) => (
              <AgentRunCard
                key={agent.name}
                name={agent.name}
                description={agent.description}
                model={agent.model}
                disabled
              />
            ))}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

export function WorkspaceMaterialsClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceKind, setSourceKind] = useState<SourceMaterialRead["source_kind"]>("paper");
  const [visibility, setVisibility] = useState<SourceMaterialRead["visibility"]>("lab_internal");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, reload] = useWorkspaceBundle(workspaceId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title.trim() || file?.name || "Untitled source");
      formData.append("source_kind", sourceKind);
      formData.append("visibility", visibility);
      if (file) {
        formData.append("upload", file);
      }
      await createWorkspaceMaterial(workspaceId, formData);
      setTitle("");
      setFile(null);
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Source material could not be saved.");
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
    return (
      <AppShell searchPlaceholder="Search workspace...">
        <PageContainer size="full">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell searchPlaceholder="Search workspace...">
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <WorkspaceShell
      workspace={state.data.workspace}
      knowledgeBase={state.data.knowledgeBase}
      active="materials"
    >
      <div className="space-y-6">
        <PageHeader
          title="Data Sources"
          description="Connect raw data to your research ecosystem using specialized AI Agents."
        />

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-7 py-5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <CloudUpload className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-extrabold">Import</h2>
            </div>
            <Badge>Open</Badge>
          </div>
          <form onSubmit={submit} className="space-y-6 p-7">
            <p className="text-lg text-muted-foreground">
              Import local folders, ZIPs, or PDF files into your workspace.
            </p>
            <div className="rounded-md border border-dashed border-blue-200 px-8 py-14 text-center">
              <UploadCloud className="mx-auto h-16 w-16 text-primary/70" />
              <p className="mt-5 text-xl font-semibold">Drag and drop files here</p>
              <p className="text-muted-foreground">or click to browse local files</p>
              <Input
                type="file"
                className="mx-auto mt-6 max-w-lg"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFile(event.target.files?.[0] ?? null)
                }
              />
            </div>
            <div className="rounded-md border p-5">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_220px_220px]">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Select className="w-80" defaultValue={state.data.agents[0]?.id ?? "none"}>
                    <option value="none">Document Parser Agent v2</option>
                    {state.data.agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </Select>
                  <Badge tone="green">Active</Badge>
                </div>
                <Link
                  href={`/workspaces/${workspaceId}/agents`}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  <Plus className="h-4 w-4" />
                  Add AI Agent
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Agent assignment is UI-only until the backend adds a material-agent relation.
              </p>
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setFile(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Search className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-extrabold">Search</h2>
          </div>
          <Badge tone="neutral">Collapsed</Badge>
        </Card>
        <Card className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Radio className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-extrabold">Subscribe</h2>
          </div>
          <Badge tone="neutral">Collapsed</Badge>
        </Card>

        {state.data.materials.length === 0 ? (
          <EmptyState
            icon={<Database className="h-10 w-10" />}
            title="No Workspace source materials yet"
            description="Upload or register source material records for this topic workspace."
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
    </WorkspaceShell>
  );
}

export function WorkspaceAgentsClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentType, setAgentType] =
    useState<AIAnalysisAgentConfigRead["agent_type"]>("paper_analysis");
  const [outputFormat, setOutputFormat] = useState("Markdown");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [currentUser, workspace] = await Promise.all([getCurrentUser(), getWorkspace(workspaceId)]);
    const [knowledgeBase, agents] = await Promise.all([
      getKnowledgeBase(workspace.knowledge_base_id),
      listWorkspaceAgents(workspaceId),
    ]);
    return { currentUser, workspace, knowledgeBase, agents };
  }, [workspaceId]);

  const [state, reload] = useProtectedLoader(loader, "Workspace agents could not be loaded.");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createWorkspaceAgent(workspaceId, {
        name: name.trim(),
        description: description.trim() || null,
        agent_type: agentType,
        output_format: outputFormat,
        is_active: true,
      });
      setName("");
      setDescription("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Workspace agent could not be saved.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeAgent = async (agentId: string) => {
    if (!window.confirm("Delete this workspace AI agent configuration?")) {
      return;
    }
    await deleteAgent(agentId);
    reload();
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer size="full">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const isAdmin = state.data.currentUser.role === "admin";

  return (
    <WorkspaceShell
      workspace={state.data.workspace}
      knowledgeBase={state.data.knowledgeBase}
      active="agents"
    >
      <div className="space-y-6">
        <PageHeader
          title="Configure AI Agent"
          description="Define specialized behaviors, knowledge bounds, and output structures for automated research tasks."
        />
        {!isAdmin ? (
          <PermissionDenied message="Only admins can create or update Workspace agent configurations." />
        ) : (
          <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <div className="space-y-5">
              <Card className="p-6">
                <h2 className="mb-5 text-2xl font-extrabold">Agent Identity</h2>
                <div className="space-y-4">
                  <FormField label="Agent Name" required>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g., Literature Synthesizer"
                    />
                  </FormField>
                  <FormField label="Description">
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the primary function of this agent..."
                    />
                  </FormField>
                </div>
              </Card>
              <Card className="p-6">
                <h2 className="mb-5 text-2xl font-extrabold">Model Configuration</h2>
                <div className="space-y-4">
                  <FormField label="Agent Type">
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
                  </FormField>
                  <FormField label="System Prompt">
                    <Textarea
                      defaultValue="You are an expert academic researcher. Critically analyze provided texts and identify methodological structure."
                      className="font-mono"
                    />
                  </FormField>
                </div>
              </Card>
              <Card className="p-6">
                <h2 className="mb-5 text-2xl font-extrabold">Output Specification</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {["Markdown", "JSON", "Plain Text"].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setOutputFormat(format)}
                      className={cn(
                        "rounded-md border px-4 py-3 font-semibold",
                        outputFormat === format
                          ? "border-primary bg-accent text-primary"
                          : "border-border",
                      )}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-5">
              <Card className="p-6">
                <h2 className="mb-4 text-2xl font-extrabold">Usage Scope</h2>
                <div className="flex flex-wrap gap-3">
                  {["Literature Review", "Data Analysis", "Drafting", "Proofreading"].map(
                    (tag) => (
                      <Badge key={tag} tone={tag === "Literature Review" ? "blue" : "neutral"}>
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </Card>
              <Card className="p-6">
                <h2 className="mb-4 text-2xl font-extrabold">Data Knowledge</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-md border p-4">
                    <input type="radio" name="scope" className="mt-1" />
                    <span>
                      <span className="block font-semibold">Full Document context</span>
                      <span className="text-sm text-muted-foreground">
                        Agent processes the entire file.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-md border border-primary bg-accent/50 p-4">
                    <input type="radio" name="scope" defaultChecked className="mt-1" />
                    <span>
                      <span className="block font-semibold">Specific Section focus</span>
                      <span className="text-sm text-muted-foreground">
                        Restrict analysis to structural parts.
                      </span>
                    </span>
                  </label>
                </div>
              </Card>
              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !name.trim()}>
                  {submitting ? "Saving..." : "New Agent"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {state.data.agents.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {state.data.agents.map((agent) => (
              <Card key={agent.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold">{agent.name}</h3>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      {agent.description ?? formatEnumLabel(agent.agent_type)}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Badge>{formatEnumLabel(agent.agent_type)}</Badge>
                      <StatusBadge status={agent.is_active ? "active" : "archived"} />
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
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}

export function WorkspaceThoughtChainsClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chainType, setChainType] =
    useState<ThoughtChainRead["chain_type"]>("research_question");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, reload] = useWorkspaceBundle(workspaceId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createWorkspaceThoughtChain(workspaceId, {
        title: title.trim(),
        description: description.trim() || null,
        chain_type: chainType,
        content: {
          summary: description.trim() || title.trim(),
          workspace_id: workspaceId,
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
    return (
      <AppShell>
        <PageContainer size="full">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <WorkspaceShell
      workspace={state.data.workspace}
      knowledgeBase={state.data.knowledgeBase}
      active="thought-chains"
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
        <Card className="relative min-h-[620px] overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,94,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative z-10 mx-auto mt-32 max-w-xl rounded-lg border bg-white p-7 shadow-soft">
            <h2 className="text-2xl font-extrabold">{workspaceGraph.centerTitle}</h2>
            <p className="mt-3 text-lg leading-8 text-muted-foreground">
              {workspaceGraph.centerDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {workspaceGraph.related.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-extrabold">Create Thought Chain</h2>
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
              title="No Workspace Thought Chains yet"
              description="Capture reasoning paths, research gaps, or method relationships for this topic."
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
    </WorkspaceShell>
  );
}

export function WorkspaceConversationsClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationRead | null>(null);
  const [messages, setMessages] = useState<ConversationMessageRead[]>([]);
  const [title, setTitle] = useState("Workspace discussion");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, reload] = useWorkspaceBundle(workspaceId);

  const startConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createWorkspaceConversation(workspaceId, title.trim());
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
    return (
      <AppShell>
        <PageContainer size="full">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <WorkspaceShell
      workspace={state.data.workspace}
      knowledgeBase={state.data.knowledgeBase}
      active="conversations"
    >
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Workspace Conversations</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Discuss generated workspace synthesis with AI. Conversation lists are not exposed by
            the backend yet.
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
              {conversation?.title ?? "Workspace discussion"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              AI responses are not generated in Module 1.
            </p>
          </div>
          <div className="flex-1 space-y-4 overflow-auto py-6">
            {messages.length === 0 ? (
              <EmptyState
                icon={<GitBranch className="h-10 w-10" />}
                title="No messages yet"
                description="Create a conversation, then send a workspace question or note."
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
              placeholder="Ask about this workspace..."
              disabled={!conversation}
            />
            <SendButton disabled={submitting || !conversation || !messageText.trim()} />
          </form>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

export function WorkspaceGraphClient({ workspaceId }: { workspaceId: string }) {
  const [state, reload] = useWorkspaceBundle(workspaceId);

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer size="full">
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer size="default">
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <WorkspaceShell
      workspace={state.data.workspace}
      knowledgeBase={state.data.knowledgeBase}
      active="graph"
    >
      <Card className="relative min-h-[720px] overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,94,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative z-10">
          <WorkspaceHeader
            workspace={state.data.workspace}
            knowledgeBase={state.data.knowledgeBase}
            actions={<Badge>Read-only generated graph</Badge>}
          />
        </div>
        <div className="relative z-10 mx-auto mt-24 max-w-2xl rounded-lg border bg-white p-8 shadow-soft">
          <h2 className="text-3xl font-extrabold">{workspaceGraph.centerTitle}</h2>
          <p className="mt-3 text-lg leading-8 text-muted-foreground">
            {workspaceGraph.centerDescription}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {workspaceGraph.related.map((item) => (
              <div key={item} className="rounded-md border bg-accent/50 p-4 font-semibold">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </WorkspaceShell>
  );
}
