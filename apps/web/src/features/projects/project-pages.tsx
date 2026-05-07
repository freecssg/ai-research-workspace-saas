"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Database,
  FileText,
  Filter,
  Folder,
  GitBranch,
  LogIn,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
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
import {
  getCurrentUser,
  listKnowledgeBaseMaterials,
  listKnowledgeBases,
  listKnowledgeBaseThoughtChains,
  listKnowledgeBaseWorkspaces,
  type ConversationMessageRead,
  type ConversationRead,
  type KnowledgeBaseRead,
  type SourceMaterialRead,
  type ThoughtChainRead,
  type WorkspaceRead,
} from "@/features/knowledge-bases/kb-api";
import {
  ErrorState,
  FormField,
  LoadingSkeleton,
  SendButton,
} from "@/features/knowledge-bases/kb-components";
import { ApiClientError } from "@/lib/api-client";
import { clearAuthSession, getStoredAccessToken, type AuthUser } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import {
  addProjectConversationMessage,
  addProjectSource,
  addProjectTeamMember,
  createProject,
  createProjectConversation,
  createProjectOutput,
  createProjectWorkflow,
  createWorkflowStep,
  deleteProject,
  deleteProjectOutput,
  deleteProjectSource,
  deleteWorkflowStep,
  listAdminUsers,
  getProject,
  listProjectOutputs,
  listProjects,
  listProjectSources,
  listProjectTeam,
  listProjectWorkflows,
  listTasks,
  listWorkflowSteps,
  removeProjectTeamMember,
  updateProjectTeamMember,
  updateWorkflowStep,
  type AgentOutputType,
  type ProjectMemberRole,
  type ProjectRead,
  type ProjectSourceSelectionRead,
  type ProjectTeamMemberRead,
  type ProjectType,
  type ProjectWorkflowStepRead,
  type WorkflowType,
} from "./project-api";
import {
  formatDate,
  formatEnumLabel,
  ProjectHeader,
  ProjectMetricCard,
  ProjectRoleBadge,
  ProjectShell,
  ProjectStatusBadge,
  ProjectTypeBadge,
  ReadOnlyNotice,
  WorkflowNode,
  WorkflowStatusBadge,
} from "./project-components";
import {
  mockWorkflowCanvasNodes,
  projectSourceBrowserHint,
  starterWorkflowSteps,
  workflowTabs,
  workflowTemplates,
} from "./project-mock-data";

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

type Capability = {
  role: ProjectMemberRole | "admin" | "non_team";
  canEdit: boolean;
  canManageTeam: boolean;
};

const projectTypes: ProjectType[] = [
  "literature_review",
  "reb_application",
  "data_analysis",
  "presentation",
  "manuscript",
  "research_proposal",
  "custom",
];

const outputTypes: AgentOutputType[] = [
  "literature_review",
  "reb_application",
  "data_report",
  "presentation_outline",
  "manuscript_section",
  "notes",
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

function computeCapability(
  currentUser: AuthUser,
  team: ProjectTeamMemberRead[],
): Capability {
  if (currentUser.role === "admin") {
    return { role: "admin", canEdit: true, canManageTeam: true };
  }

  const membership = team.find((member) => member.user_id === currentUser.id);
  if (!membership) {
    return { role: "non_team", canEdit: false, canManageTeam: false };
  }

  return {
    role: membership.member_role,
    canEdit: membership.member_role === "leader" || membership.member_role === "editor",
    canManageTeam: membership.member_role === "leader",
  };
}

function projectProgress(status: string) {
  if (status === "completed") {
    return 100;
  }
  if (status === "active") {
    return 65;
  }
  if (status === "archived") {
    return 100;
  }
  return 20;
}

function sourceTypeLabel(source: ProjectSourceSelectionRead) {
  if (source.source_material_id) {
    return "SourceMaterial";
  }
  if (source.thought_chain_id) {
    return "ThoughtChain";
  }
  if (source.workspace_id) {
    return "Workspace";
  }
  if (source.knowledge_base_id) {
    return "KnowledgeBase";
  }
  return "Source";
}

function sourceId(source: ProjectSourceSelectionRead) {
  return (
    source.source_material_id ??
    source.thought_chain_id ??
    source.workspace_id ??
    source.knowledge_base_id ??
    source.id
  );
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

function useProjectBundle(projectId: string) {
  const loader = useCallback(async () => {
    const [currentUser, project, team, sources, workflows, outputs, allTasks] =
      await Promise.all([
        getCurrentUser(),
        getProject(projectId),
        listProjectTeam(projectId).catch(() => []),
        listProjectSources(projectId).catch(() => []),
        listProjectWorkflows(projectId).catch(() => []),
        listProjectOutputs(projectId).catch(() => []),
        listTasks().catch(() => []),
      ]);

    return {
      currentUser,
      project,
      team,
      sources,
      workflows,
      outputs,
      tasks: allTasks.filter((task) => task.project_id === projectId),
    };
  }, [projectId]);

  return useProtectedLoader(loader, "Project details could not be loaded.");
}

export function ProjectListClient() {
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const projects = await listProjects();
    const metrics = await Promise.allSettled(
      projects.map(async (project) => {
        const [team, workflows, outputs] = await Promise.all([
          listProjectTeam(project.id).catch(() => []),
          listProjectWorkflows(project.id).catch(() => []),
          listProjectOutputs(project.id).catch(() => []),
        ]);
        return { projectId: project.id, team, workflows, outputs };
      }),
    );

    const metricMap = new Map(
      metrics
        .filter((result) => result.status === "fulfilled")
        .map((result) => [result.value.projectId, result.value]),
    );

    return { projects, metricMap };
  }, []);

  const [state, reload] = useProtectedLoader(loader, "Projects could not be loaded.");

  const filtered = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
      return state.data.projects;
    }
    return state.data.projects.filter((project) =>
      [project.name, project.description ?? "", project.output_objective, project.project_type]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery),
    );
  }, [query, state]);

  const removeProject = async (project: ProjectRead) => {
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      reload();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageContainer className="pt-4">
        <PageHeader
          title="Projects"
          description="Manage and access your active research workflows."
          actions={
            <>
              <div className="relative hidden w-72 md:block">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter Projects..."
                  className="pl-10"
                />
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="secondary">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Link href="/projects/new" className={buttonVariants()}>
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </>
          }
        />

        {state.status === "loading" ? <LoadingSkeleton variant="table" /> : null}
        {state.status === "error" ? <ErrorState message={state.message} onRetry={reload} /> : null}

        {state.status === "ready" && filtered.length === 0 ? (
          <EmptyState
            icon={<Folder className="h-10 w-10" />}
            title="No Projects found"
            description="Create an output-oriented project to turn selected sources into academic deliverables."
            action={
              <Link href="/projects/new" className={buttonVariants()}>
                <Plus className="h-4 w-4" />
                Create Project
              </Link>
            }
          />
        ) : null}

        {state.status === "ready" && filtered.length > 0 ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Create Date</TableHead>
                  <TableHead>Modify Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => {
                  const metrics = state.data.metricMap.get(project.id);
                  const progress = projectProgress(project.status);
                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-lg font-semibold text-primary"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                          {project.output_objective}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ProjectTypeBadge type={project.project_type} />
                      </TableCell>
                      <TableCell>{metrics?.team.length ?? 0} members</TableCell>
                      <TableCell>{formatDate(project.created_at)}</TableCell>
                      <TableCell>{formatDate(project.updated_at)}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <ProjectStatusBadge status={project.status} />
                          <div className="flex items-center gap-3">
                            <ProgressBar value={progress} className="w-32" />
                            <span className="text-xs text-muted-foreground">
                              {metrics?.workflows.length ?? 0} workflows,{" "}
                              {metrics?.outputs.length ?? 0} outputs
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <SmallLinkButton
                            href={`/projects/${project.id}`}
                            label="Open Project"
                            icon={<LogIn className="h-5 w-5" />}
                          />
                          <SmallLinkButton
                            href={`/projects/${project.id}/workflow`}
                            label="Workflow"
                            icon={<GitBranch className="h-5 w-5" />}
                          />
                          <SmallLinkButton
                            href={`/projects/${project.id}/outputs`}
                            label="Outputs"
                            icon={<FileText className="h-5 w-5" />}
                          />
                          <IconButton
                            icon={<Trash2 className="h-5 w-5" />}
                            label="Delete project"
                            tone="danger"
                            disabled={deletingId === project.id}
                            onClick={() => void removeProject(project)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-7 py-5 text-sm text-muted-foreground">
              <span>Showing 1 to {filtered.length} of {state.data.projects.length} entries</span>
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

export function ProjectNewClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [outputObjective, setOutputObjective] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("literature_review");
  const [teamUserId, setTeamUserId] = useState("");
  const [teamRole, setTeamRole] = useState<ProjectMemberRole>("viewer");
  const [selectedKbId, setSelectedKbId] = useState("");
  const [sourceReason, setSourceReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useCallback(async () => {
    const [currentUser, knowledgeBases] = await Promise.all([
      getCurrentUser(),
      listKnowledgeBases().catch(() => []),
    ]);
    const users =
      currentUser.role === "admin" ? await listAdminUsers().catch(() => []) : [];
    return { currentUser, knowledgeBases, users };
  }, []);

  const [state, reload] = useProtectedLoader(loader, "Project creation context could not load.");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !outputObjective.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
        output_objective: outputObjective.trim(),
        project_type: projectType,
        status: "draft",
      });

      if (teamUserId.trim()) {
        await addProjectTeamMember(project.id, {
          user_id: teamUserId.trim(),
          member_role: teamRole,
        }).catch(() => null);
      }

      if (selectedKbId) {
        await addProjectSource(project.id, {
          knowledge_base_id: selectedKbId,
          selection_reason: sourceReason.trim() || "Initial project resource mapping",
        }).catch(() => null);
      }

      router.push(`/projects/${project.id}`);
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project could not be created.");
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
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer className="pt-2">
        <div className="mb-8 text-sm text-muted-foreground">
          Knowledge Base <span className="mx-2">/</span> Workspace{" "}
          <span className="mx-2">/</span> New Project
        </div>
        <PageHeader
          title="Create New Project"
          description="Initialize a new output-oriented research project and define core parameters."
        />

        <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[1fr_480px]">
          <div className="space-y-6">
            <Card className="p-7">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold">
                <FileText className="h-6 w-6 text-primary" />
                Project Information
              </h2>
              <div className="space-y-5">
                <FormField label="Project Title" required>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g., Cognitive Load in LLM Interfaces"
                  />
                </FormField>
                <FormField label="Introduction / Description">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Briefly describe the scope and hypothesis..."
                    className="min-h-32"
                  />
                </FormField>
                <FormField label="Project Objectives / Output Objective" required>
                  <Textarea
                    value={outputObjective}
                    onChange={(event) => setOutputObjective(event.target.value)}
                    placeholder="Define the academic output this project should produce..."
                    className="min-h-28"
                  />
                </FormField>
              </div>
            </Card>

            <Card className="p-7">
              <h2 className="mb-6 text-2xl font-extrabold">Extra Information</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Project Type">
                  <Select
                    value={projectType}
                    onChange={(event) => setProjectType(event.target.value as ProjectType)}
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {formatEnumLabel(type)}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Status">
                  <Input value="Draft" disabled />
                </FormField>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-2xl font-extrabold">
                  <Users className="h-6 w-6 text-primary" />
                  Team Members
                </h2>
                <Badge>Creator becomes leader</Badge>
              </div>
              <div className="rounded-md bg-accent/60 p-4">
                <p className="font-semibold">{state.data.currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{state.data.currentUser.email}</p>
                <ProjectRoleBadge role="leader" />
              </div>
              <div className="mt-5 grid gap-3">
                {state.data.users.length > 0 ? (
                  <Select
                    value={teamUserId}
                    onChange={(event) => setTeamUserId(event.target.value)}
                  >
                    <option value="">Optional additional member</option>
                    {state.data.users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={teamUserId}
                    onChange={(event) => setTeamUserId(event.target.value)}
                    placeholder="Optional teammate user ID"
                  />
                )}
                <Select
                  value={teamRole}
                  onChange={(event) => setTeamRole(event.target.value as ProjectMemberRole)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="leader">Leader</option>
                </Select>
              </div>
            </Card>

            <Card className="p-7">
              <h2 className="mb-5 flex items-center gap-3 text-2xl font-extrabold">
                <Database className="h-6 w-6 text-primary" />
                Resource Mapping
              </h2>
              <p className="mb-4 text-sm leading-6 text-muted-foreground">
                Select Knowledge Bases, Workspaces, SourceMaterials, or ThoughtChains later.
                This initial form can persist one KnowledgeBase source selection.
              </p>
              <Select
                value={selectedKbId}
                onChange={(event) => setSelectedKbId(event.target.value)}
              >
                <option value="">Optional KnowledgeBase source</option>
                {state.data.knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))}
              </Select>
              <Textarea
                value={sourceReason}
                onChange={(event) => setSourceReason(event.target.value)}
                placeholder="Selection reason..."
                className="mt-4"
              />
            </Card>

            <Card className="bg-accent/60 p-7">
              <p className="font-semibold">Review all details before initializing.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A Project is independent from KnowledgeBases and Workspaces. Resource Mapping
                creates ProjectSourceSelection records.
              </p>
              {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
              <div className="mt-6 flex gap-3">
                <Link href="/projects" className={buttonVariants({ variant: "secondary" })}>
                  Cancel
                </Link>
                <Button type="submit" disabled={submitting || !name.trim() || !outputObjective.trim()}>
                  {submitting ? "Creating..." : "Enter Project"}
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </PageContainer>
    </AppShell>
  );
}

export function ProjectOverviewClient({ projectId }: { projectId: string }) {
  const [state, reload] = useProjectBundle(projectId);

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="overview">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
        actions={
          <Link href={`/projects/${projectId}/workflow`} className={buttonVariants()}>
            Open Workflow
          </Link>
        }
      />
      <ReadOnlyNotice canEdit={capability.canEdit} />

      <div className="mt-6 grid gap-5 xl:grid-cols-4">
        <ProjectMetricCard
          title="Team"
          value={state.data.team.length}
          icon={<Users className="h-6 w-6" />}
          description="Project roles define who can edit workflow and outputs."
        />
        <ProjectMetricCard
          title="Sources"
          value={state.data.sources.length}
          icon={<Database className="h-6 w-6" />}
          description="Selections reference existing research assets without moving them."
        />
        <ProjectMetricCard
          title="Workflows"
          value={state.data.workflows.length}
          icon={<GitBranch className="h-6 w-6" />}
          description="Academic output processes and step records."
        />
        <ProjectMetricCard
          title="Outputs"
          value={state.data.outputs.length}
          icon={<FileText className="h-6 w-6" />}
          description="Editable project-level generated drafts and notes."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Selected Source Summary</h2>
          <div className="mt-5 space-y-3">
            {state.data.sources.length === 0 ? (
              <p className="text-muted-foreground">No source selections yet.</p>
            ) : (
              state.data.sources.slice(0, 5).map((source) => (
                <div key={source.id} className="rounded-md border p-4">
                  <Badge>{sourceTypeLabel(source)}</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {source.selection_reason ?? `Reference ${sourceId(source).slice(0, 8)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Task / Status Summary</h2>
          <div className="mt-5 space-y-3">
            {state.data.tasks.length === 0 ? (
              <p className="text-muted-foreground">No project tasks have been queued.</p>
            ) : (
              state.data.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{formatEnumLabel(task.task_type)}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <ProgressBar value={task.progress} className="mt-3" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectSourcesClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, reload] = useProjectBundle(projectId);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseRead[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceRead[]>([]);
  const [materials, setMaterials] = useState<SourceMaterialRead[]>([]);
  const [thoughtChains, setThoughtChains] = useState<ThoughtChainRead[]>([]);
  const [sourceKind, setSourceKind] = useState<"knowledge_base" | "workspace" | "material" | "thought_chain">("knowledge_base");
  const [kbId, setKbId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [thoughtChainId, setThoughtChainId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredAccessToken()) {
      return;
    }
    void listKnowledgeBases().then(setKnowledgeBases).catch(() => setKnowledgeBases([]));
  }, []);

  useEffect(() => {
    if (!kbId) {
      setWorkspaces([]);
      setMaterials([]);
      setThoughtChains([]);
      return;
    }
    void Promise.all([
      listKnowledgeBaseWorkspaces(kbId).catch(() => []),
      listKnowledgeBaseMaterials(kbId).catch(() => []),
      listKnowledgeBaseThoughtChains(kbId).catch(() => []),
    ]).then(([nextWorkspaces, nextMaterials, nextThoughtChains]) => {
      setWorkspaces(nextWorkspaces);
      setMaterials(nextMaterials);
      setThoughtChains(nextThoughtChains);
    });
  }, [kbId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addProjectSource(projectId, {
        knowledge_base_id: kbId || null,
        workspace_id: sourceKind === "workspace" ? workspaceId || null : null,
        source_material_id: sourceKind === "material" ? materialId || null : null,
        thought_chain_id: sourceKind === "thought_chain" ? thoughtChainId || null : null,
        selection_reason: reason.trim() || null,
      });
      setReason("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project source could not be added.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeSource = async (sourceSelectionId: string) => {
    if (!window.confirm("Remove this source selection from the project?")) {
      return;
    }
    await deleteProjectSource(projectId, sourceSelectionId);
    reload();
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="sources">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
      />
      <ReadOnlyNotice canEdit={capability.canEdit} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Selected Project Sources</h2>
          <p className="mt-2 text-muted-foreground">
            Source selections reference existing KnowledgeBases, Workspaces, SourceMaterials,
            and ThoughtChains. They do not move or duplicate source content.
          </p>
          <div className="mt-6 space-y-3">
            {state.data.sources.length === 0 ? (
              <EmptyState
                icon={<Database className="h-10 w-10" />}
                title="No selected sources yet"
                description="Add source selections to preserve traceability for later project outputs."
              />
            ) : (
              state.data.sources.map((source) => (
                <div key={source.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge>{sourceTypeLabel(source)}</Badge>
                      <p className="mt-3 font-semibold">Reference {sourceId(source).slice(0, 12)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {source.selection_reason ?? "No selection reason recorded."}
                      </p>
                    </div>
                    {capability.canEdit ? (
                      <IconButton
                        icon={<Trash2 className="h-5 w-5" />}
                        label="Remove source"
                        tone="danger"
                        onClick={() => void removeSource(source.id)}
                      />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Add Source</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {projectSourceBrowserHint.description}
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Select
              value={sourceKind}
              onChange={(event) =>
                setSourceKind(event.target.value as "knowledge_base" | "workspace" | "material" | "thought_chain")
              }
              disabled={!capability.canEdit}
            >
              <option value="knowledge_base">KnowledgeBase</option>
              <option value="workspace">Workspace</option>
              <option value="material">SourceMaterial</option>
              <option value="thought_chain">ThoughtChain</option>
            </Select>
            <Select value={kbId} onChange={(event) => setKbId(event.target.value)} disabled={!capability.canEdit}>
              <option value="">Select KnowledgeBase</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name}
                </option>
              ))}
            </Select>
            {sourceKind === "workspace" ? (
              <Select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} disabled={!capability.canEdit || !kbId}>
                <option value="">Select Workspace</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </Select>
            ) : null}
            {sourceKind === "material" ? (
              <Select value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={!capability.canEdit || !kbId}>
                <option value="">Select SourceMaterial</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.title}
                  </option>
                ))}
              </Select>
            ) : null}
            {sourceKind === "thought_chain" ? (
              <Select value={thoughtChainId} onChange={(event) => setThoughtChainId(event.target.value)} disabled={!capability.canEdit || !kbId}>
                <option value="">Select ThoughtChain</option>
                {thoughtChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.title}
                  </option>
                ))}
              </Select>
            ) : null}
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Selection reason for traceability..."
              disabled={!capability.canEdit}
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" disabled={!capability.canEdit || submitting || !kbId} className="w-full">
              {submitting ? "Adding..." : "Add Project Source"}
            </Button>
          </form>
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectWorkflowClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, reload] = useProjectBundle(projectId);
  const [activeType, setActiveType] = useState<WorkflowType>("literature_review");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [steps, setSteps] = useState<ProjectWorkflowStepRead[]>([]);
  const [newStepName, setNewStepName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWorkflow = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }
    return (
      state.data.workflows.find((workflow) => workflow.id === selectedWorkflowId) ??
      state.data.workflows[0] ??
      null
    );
  }, [selectedWorkflowId, state]);

  useEffect(() => {
    if (selectedWorkflow?.id) {
      void listWorkflowSteps(selectedWorkflow.id).then(setSteps).catch(() => setSteps([]));
    } else {
      setSteps([]);
    }
  }, [selectedWorkflow?.id]);

  const createFromTemplate = async (templateName: string, type: WorkflowType) => {
    setSubmitting(true);
    setError(null);
    try {
      const workflow = await createProjectWorkflow(projectId, {
        name: templateName,
        description: "Frontend template preset. Execution is not implemented in Module 1.",
        workflow_type: type,
        status: "draft",
      });
      for (const [index, step] of starterWorkflowSteps.entries()) {
        await createWorkflowStep(workflow.id, {
          step_order: index,
          name: step.name,
          description: step.description,
          agent_type: step.agent_type,
          status: "pending",
        });
      }
      setSelectedWorkflowId(workflow.id);
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Workflow could not be created.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const addStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkflow || !newStepName.trim()) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createWorkflowStep(selectedWorkflow.id, {
        step_order: steps.length,
        name: newStepName.trim(),
        description: null,
        agent_type: "custom",
        status: "pending",
      });
      setNewStepName("");
      const nextSteps = await listWorkflowSteps(selectedWorkflow.id);
      setSteps(nextSteps);
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Workflow step could not be added.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const markStepComplete = async (step: ProjectWorkflowStepRead) => {
    await updateWorkflowStep(step.id, { status: "completed" });
    if (selectedWorkflow) {
      setSteps(await listWorkflowSteps(selectedWorkflow.id));
    }
  };

  const removeStep = async (step: ProjectWorkflowStepRead) => {
    if (!window.confirm("Delete this workflow step?")) {
      return;
    }
    await deleteWorkflowStep(step.id);
    if (selectedWorkflow) {
      setSteps(await listWorkflowSteps(selectedWorkflow.id));
    }
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="workflow">
      <ReadOnlyNotice canEdit={capability.canEdit} />
      <div className="mt-4 grid min-h-[720px] gap-4 xl:grid-cols-[300px_1fr_330px]">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Projects</h2>
          <Link href="/projects/new" className={cn(buttonVariants(), "mt-5 w-full")}>
            <Plus className="h-4 w-4" />
            New Project
          </Link>
          <div className="mt-7 space-y-3">
            <div className="rounded-md border border-primary bg-accent p-4">
              <p className="font-semibold">{state.data.project.name}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatEnumLabel(state.data.project.project_type)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex border-b">
            {workflowTabs.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveType(tab.type)}
                className={cn(
                  "h-16 flex-1 border-b-2 px-4 font-semibold text-muted-foreground",
                  activeType === tab.type
                    ? "border-primary text-primary"
                    : "border-transparent",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative min-h-[650px] overflow-hidden p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,94,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
            <div className="relative z-10">
              {selectedWorkflow ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold">{selectedWorkflow.name}</h2>
                      <WorkflowStatusBadge status={selectedWorkflow.status} />
                    </div>
                    <Button disabled title="Workflow execution will create a task in a later task flow.">
                      Run Workflow
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {steps.map((step) => (
                      <WorkflowNode
                        key={step.id}
                        title={step.name}
                        subtitle={step.agent_type ? formatEnumLabel(step.agent_type) : "Manual step"}
                        body={step.description ?? formatEnumLabel(step.status)}
                        icon={<Bot className="h-5 w-5" />}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  {mockWorkflowCanvasNodes.map((node) => (
                    <WorkflowNode
                      key={node.title}
                      title={node.title}
                      subtitle={node.subtitle}
                      body={node.body}
                      icon={node.kind === "data" ? <Database className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Existing Workflows</h2>
            <Badge>{state.data.workflows.length}</Badge>
          </div>
          <div className="space-y-3">
            {state.data.workflows.map((workflow) => (
              <button
                key={workflow.id}
                type="button"
                onClick={() => setSelectedWorkflowId(workflow.id)}
                className={cn(
                  "w-full rounded-md border p-4 text-left font-semibold",
                  selectedWorkflow?.id === workflow.id && "border-primary bg-accent text-primary",
                )}
              >
                {workflow.name}
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {formatEnumLabel(workflow.workflow_type)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-3 font-bold">Workflow Templates</h3>
            <div className="space-y-3">
              {workflowTemplates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  disabled={!capability.canEdit || submitting}
                  onClick={() => void createFromTemplate(template.name, template.type)}
                  className="w-full rounded-md border p-4 text-left hover:bg-accent disabled:opacity-50"
                >
                  <span className="font-semibold">{template.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedWorkflow ? (
            <form onSubmit={addStep} className="mt-6 space-y-3 border-t pt-5">
              <Input
                value={newStepName}
                onChange={(event) => setNewStepName(event.target.value)}
                placeholder="New workflow step"
                disabled={!capability.canEdit}
              />
              <Button type="submit" disabled={!capability.canEdit || submitting || !newStepName.trim()} className="w-full">
                Add Step
              </Button>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    <span>{step.name}</span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!capability.canEdit}
                        onClick={() => void markStepComplete(step)}
                      >
                        Done
                      </Button>
                      <IconButton
                        icon={<Trash2 className="h-4 w-4" />}
                        label="Delete step"
                        tone="danger"
                        disabled={!capability.canEdit}
                        onClick={() => void removeStep(step)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          ) : null}
          {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectOutputsClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, reload] = useProjectBundle(projectId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [outputType, setOutputType] = useState<AgentOutputType>("literature_review");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createProjectOutput(projectId, {
        title: title.trim(),
        content: content.trim(),
        output_type: outputType,
        source_refs: { note: "Created from Project outputs page" },
      });
      setTitle("");
      setContent("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project output could not be saved.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeOutput = async (outputId: string) => {
    if (!window.confirm("Delete this project output?")) {
      return;
    }
    await deleteProjectOutput(outputId);
    reload();
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="outputs">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
      />
      <ReadOnlyNotice canEdit={capability.canEdit} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {state.data.outputs.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-10 w-10" />}
              title="No Project outputs yet"
              description="Project outputs are editable deliverables, separate from read-only KnowledgeBase and Workspace generated content."
            />
          ) : (
            state.data.outputs.map((output) => (
              <Card key={output.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge>{formatEnumLabel(output.output_type)}</Badge>
                    <h2 className="mt-3 text-2xl font-extrabold">{output.title}</h2>
                    <p className="mt-3 line-clamp-4 leading-7 text-muted-foreground">
                      {output.content}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Updated {formatDate(output.updated_at)}
                    </p>
                  </div>
                  {capability.canEdit ? (
                    <IconButton
                      icon={<Trash2 className="h-5 w-5" />}
                      label="Delete output"
                      tone="danger"
                      onClick={() => void removeOutput(output.id)}
                    />
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Create Output Placeholder</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This creates an AgentOutput record only. It does not generate academic text.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Select
              value={outputType}
              onChange={(event) => setOutputType(event.target.value as AgentOutputType)}
              disabled={!capability.canEdit}
            >
              {outputTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEnumLabel(type)}
                </option>
              ))}
            </Select>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Output title"
              disabled={!capability.canEdit}
            />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Output notes or draft placeholder..."
              disabled={!capability.canEdit}
              className="min-h-40"
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" disabled={!capability.canEdit || submitting || !title.trim() || !content.trim()} className="w-full">
              {submitting ? "Saving..." : "Create Output"}
            </Button>
          </form>
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectTeamClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, reload] = useProjectBundle(projectId);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectMemberRole>("viewer");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "ready" && state.data.currentUser.role === "admin") {
      void listAdminUsers().then(setUsers).catch(() => setUsers([]));
    }
  }, [state]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addProjectTeamMember(projectId, {
        user_id: userId.trim(),
        member_role: role,
      });
      setUserId("");
      reload();
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project member could not be added.");
      if (message) {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateRole = async (member: ProjectTeamMemberRead, memberRole: ProjectMemberRole) => {
    await updateProjectTeamMember(projectId, member.user_id, { member_role: memberRole });
    reload();
  };

  const removeMember = async (member: ProjectTeamMemberRead) => {
    if (!window.confirm("Remove this project team member?")) {
      return;
    }
    await removeProjectTeamMember(projectId, member.user_id);
    reload();
  };

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="team">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
      />
      <ReadOnlyNotice canEdit={capability.canManageTeam} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.data.team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>Lab user {member.user_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <ProjectRoleBadge role={member.member_role} />
                  </TableCell>
                  <TableCell>{formatDate(member.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Select
                        value={member.member_role}
                        onChange={(event) =>
                          void updateRole(member, event.target.value as ProjectMemberRole)
                        }
                        disabled={!capability.canManageTeam}
                        className="w-32"
                      >
                        <option value="leader">Leader</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </Select>
                      <IconButton
                        icon={<Trash2 className="h-5 w-5" />}
                        label="Remove member"
                        tone="danger"
                        disabled={!capability.canManageTeam}
                        onClick={() => void removeMember(member)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-7">
          <h2 className="text-2xl font-extrabold">Add Team Member</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Admins can choose from the user list. Non-admin project leaders need a user ID
            until a member lookup endpoint is added.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            {users.length > 0 ? (
              <Select value={userId} onChange={(event) => setUserId(event.target.value)} disabled={!capability.canManageTeam}>
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="User ID"
                disabled={!capability.canManageTeam}
              />
            )}
            <Select
              value={role}
              onChange={(event) => setRole(event.target.value as ProjectMemberRole)}
              disabled={!capability.canManageTeam}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="leader">Leader</option>
            </Select>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" disabled={!capability.canManageTeam || submitting || !userId.trim()} className="w-full">
              {submitting ? "Adding..." : "Add Member"}
            </Button>
          </form>
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectConversationsClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, reload] = useProjectBundle(projectId);
  const [conversation, setConversation] = useState<ConversationRead | null>(null);
  const [messages, setMessages] = useState<ConversationMessageRead[]>([]);
  const [title, setTitle] = useState("Project workflow discussion");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createProjectConversation(projectId, title.trim());
      setConversation(created);
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project conversation could not be created.");
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
      const created = await addProjectConversationMessage(conversation.id, {
        sender_type: "user",
        content: messageText.trim(),
      });
      setMessages((current) => [...current, created]);
      setMessageText("");
    } catch (submitError) {
      const message = handlePageError(submitError, router, "Project message could not be sent.");
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
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="conversations">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
      />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Project Conversations</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Discuss project workflow, selected sources, and output logic. The backend supports
            creating a conversation and posting messages, but no list endpoint exists yet.
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
              {conversation?.title ?? "Project discussion"}
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
                description="Create a conversation, then send a project workflow question or note."
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
              placeholder="Ask about this project..."
              disabled={!conversation}
            />
            <SendButton disabled={submitting || !conversation || !messageText.trim()} />
          </form>
        </Card>
      </div>
    </ProjectShell>
  );
}

export function ProjectTasksClient({ projectId }: { projectId: string }) {
  const [state, reload] = useProjectBundle(projectId);

  if (state.status === "loading") {
    return (
      <AppShell>
        <PageContainer>
          <LoadingSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={state.message} onRetry={reload} />
        </PageContainer>
      </AppShell>
    );
  }

  const capability = computeCapability(state.data.currentUser, state.data.team);

  return (
    <ProjectShell project={state.data.project} active="tasks">
      <ProjectHeader
        project={state.data.project}
        roleLabel={<ProjectRoleBadge role={capability.role} />}
      />
      {state.data.tasks.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="h-10 w-10" />}
          title="No project tasks yet"
          description="Task records appear here when project workflow runs or checks are queued. Real workers are outside Module 1."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Error / Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.data.tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-semibold">{formatEnumLabel(task.task_type)}</div>
                    <div className="text-xs text-muted-foreground">{formatEnumLabel(task.task_scope)}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={task.progress} className="w-40" />
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(task.updated_at)}</TableCell>
                  <TableCell>{task.error_message ?? task.result_ref ?? "No result yet"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </ProjectShell>
  );
}
