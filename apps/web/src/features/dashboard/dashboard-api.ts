import type { AuthUser } from "@/lib/auth-client";
import { apiGet } from "@/lib/api-client";

export type KnowledgeBaseRead = {
  id: string;
  name: string;
  description: string | null;
  research_domain: string;
  status: "draft" | "building" | "ready" | "failed" | "archived";
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceRead = {
  id: string;
  knowledge_base_id: string;
  name: string;
  description: string | null;
  research_topic: string;
  status: "draft" | "analyzing" | "ready" | "failed" | "archived";
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectRead = {
  id: string;
  name: string;
  description: string | null;
  output_objective: string;
  project_type:
    | "literature_review"
    | "reb_application"
    | "data_analysis"
    | "presentation"
    | "manuscript"
    | "research_proposal"
    | "custom";
  status: "draft" | "active" | "completed" | "archived";
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type TaskRead = {
  id: string;
  task_scope: "knowledge_base" | "workspace" | "project" | "system";
  knowledge_base_id: string | null;
  workspace_id: string | null;
  project_id: string | null;
  task_type:
    | "source_analysis"
    | "wiki_build"
    | "rag_index"
    | "graph_build"
    | "agent_run"
    | "workflow_run"
    | "citation_check"
    | "consistency_check";
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  error_message: string | null;
  result_ref: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ThoughtChainRead = {
  id: string;
  knowledge_base_id: string;
  workspace_id: string | null;
  title: string;
  description: string | null;
  chain_type:
    | "theory_path"
    | "method_relation"
    | "concept_relation"
    | "research_gap"
    | "research_question"
    | "argument_structure"
    | "data_theory_mapping"
    | "custom";
  content: Record<string, unknown>;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type DashboardData = {
  currentUser: AuthUser;
  knowledgeBases: KnowledgeBaseRead[];
  workspaces: WorkspaceRead[];
  projects: ProjectRead[];
  tasks: TaskRead[];
  thoughtChains: ThoughtChainRead[];
  sectionErrors: Partial<
    Record<"knowledgeBases" | "workspaces" | "projects" | "tasks" | "thoughtChains", string>
  >;
};

function newestFirst<T extends { updated_at?: string; created_at: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.updated_at ?? left.created_at).getTime();
    const rightDate = new Date(right.updated_at ?? right.created_at).getTime();
    return rightDate - leftDate;
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load this section.";
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const currentUser = await apiGet<AuthUser>("/auth/me");
  const sectionErrors: DashboardData["sectionErrors"] = {};

  const [knowledgeBaseResult, projectResult, taskResult] = await Promise.allSettled([
    apiGet<KnowledgeBaseRead[]>("/knowledge-bases?skip=0&limit=50"),
    apiGet<ProjectRead[]>("/projects?skip=0&limit=50"),
    apiGet<TaskRead[]>("/tasks?skip=0&limit=8"),
  ]);

  const knowledgeBases =
    knowledgeBaseResult.status === "fulfilled" ? knowledgeBaseResult.value : [];
  const projects = projectResult.status === "fulfilled" ? projectResult.value : [];
  const tasks = taskResult.status === "fulfilled" ? taskResult.value : [];

  if (knowledgeBaseResult.status === "rejected") {
    sectionErrors.knowledgeBases = getErrorMessage(knowledgeBaseResult.reason);
  }

  if (projectResult.status === "rejected") {
    sectionErrors.projects = getErrorMessage(projectResult.reason);
  }

  if (taskResult.status === "rejected") {
    sectionErrors.tasks = getErrorMessage(taskResult.reason);
  }

  const workspaceResults = await Promise.allSettled(
    knowledgeBases
      .slice(0, 8)
      .map((kb) =>
        apiGet<WorkspaceRead[]>(`/knowledge-bases/${kb.id}/workspaces?skip=0&limit=6`),
      ),
  );
  const workspaces = workspaceResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (workspaceResults.some((result) => result.status === "rejected")) {
    sectionErrors.workspaces = "Some workspace lists could not be loaded.";
  }

  const thoughtChainResults = await Promise.allSettled(
    knowledgeBases
      .slice(0, 4)
      .map((kb) =>
        apiGet<ThoughtChainRead[]>(
          `/knowledge-bases/${kb.id}/thought-chains?skip=0&limit=4`,
        ),
      ),
  );
  const thoughtChains = thoughtChainResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (thoughtChainResults.some((result) => result.status === "rejected")) {
    sectionErrors.thoughtChains = "Some thought-chain lists could not be loaded.";
  }

  return {
    currentUser,
    knowledgeBases: newestFirst(knowledgeBases),
    workspaces: newestFirst(workspaces),
    projects: newestFirst(projects),
    tasks: newestFirst(tasks),
    thoughtChains: newestFirst(thoughtChains),
    sectionErrors,
  };
}
