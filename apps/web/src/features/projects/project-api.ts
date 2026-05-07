import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth-client";
import type { ConversationMessageRead, ConversationRead } from "@/features/knowledge-bases/kb-api";

export type MessageResponse = {
  detail: string;
};

export type ProjectType =
  | "literature_review"
  | "reb_application"
  | "data_analysis"
  | "presentation"
  | "manuscript"
  | "research_proposal"
  | "custom";

export type ProjectStatus = "draft" | "active" | "completed" | "archived";

export type ProjectRead = {
  id: string;
  name: string;
  description: string | null;
  output_objective: string;
  project_type: ProjectType;
  status: ProjectStatus;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectCreate = {
  name: string;
  description?: string | null;
  output_objective: string;
  project_type: ProjectType;
  status?: ProjectStatus;
};

export type ProjectMemberRole = "leader" | "editor" | "viewer";

export type ProjectTeamMemberRead = {
  id: string;
  project_id: string;
  user_id: string;
  member_role: ProjectMemberRole;
  created_at: string;
  updated_at: string;
};

export type ProjectSourceSelectionRead = {
  id: string;
  project_id: string;
  knowledge_base_id: string | null;
  workspace_id: string | null;
  source_material_id: string | null;
  thought_chain_id: string | null;
  selection_reason: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectSourceSelectionCreate = {
  knowledge_base_id?: string | null;
  workspace_id?: string | null;
  source_material_id?: string | null;
  thought_chain_id?: string | null;
  selection_reason?: string | null;
};

export type WorkflowType =
  | "literature_review"
  | "reb_application"
  | "data_analysis"
  | "presentation"
  | "manuscript"
  | "custom";

export type WorkflowStatus = "draft" | "running" | "completed" | "failed" | "paused";

export type ProjectWorkflowRead = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  workflow_type: WorkflowType;
  status: WorkflowStatus;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectWorkflowCreate = {
  name: string;
  description?: string | null;
  workflow_type: WorkflowType;
  status?: WorkflowStatus;
};

export type WorkflowStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export type AnalysisAgentType =
  | "paper_analysis"
  | "dataset_analysis"
  | "method_extraction"
  | "theory_mapping"
  | "citation_analysis"
  | "trend_analysis"
  | "rag_indexing"
  | "graph_building"
  | "custom";

export type ProjectWorkflowStepRead = {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  description: string | null;
  agent_type: AnalysisAgentType | null;
  status: WorkflowStepStatus;
  input_refs: Record<string, unknown> | null;
  output_refs: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ProjectWorkflowStepCreate = {
  step_order: number;
  name: string;
  description?: string | null;
  agent_type?: AnalysisAgentType | null;
  status?: WorkflowStepStatus;
  input_refs?: Record<string, unknown> | null;
  output_refs?: Record<string, unknown> | null;
};

export type AgentOutputType =
  | "wiki_page"
  | "paper_summary"
  | "dataset_summary"
  | "method_summary"
  | "trend_summary"
  | "literature_review"
  | "reb_application"
  | "data_report"
  | "presentation_outline"
  | "manuscript_section"
  | "notes"
  | "custom";

export type AgentOutputRead = {
  id: string;
  project_id: string | null;
  knowledge_base_id: string | null;
  workspace_id: string | null;
  workflow_id: string | null;
  workflow_step_id: string | null;
  source_task_id: string | null;
  output_type: AgentOutputType;
  title: string;
  content: string;
  source_refs: Record<string, unknown> | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type AgentOutputCreate = {
  output_type: AgentOutputType;
  title: string;
  content: string;
  source_refs?: Record<string, unknown> | null;
  knowledge_base_id?: string | null;
  workspace_id?: string | null;
  workflow_id?: string | null;
  workflow_step_id?: string | null;
  source_task_id?: string | null;
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

export type UserRead = AuthUser;

export function listProjects() {
  return apiGet<ProjectRead[]>("/projects?skip=0&limit=50");
}

export function createProject(payload: ProjectCreate) {
  return apiPost<ProjectRead>("/projects", payload);
}

export function getProject(projectId: string) {
  return apiGet<ProjectRead>(`/projects/${projectId}`);
}

export function updateProject(projectId: string, payload: Partial<ProjectCreate>) {
  return apiPatch<ProjectRead>(`/projects/${projectId}`, payload);
}

export function deleteProject(projectId: string) {
  return apiDelete<MessageResponse>(`/projects/${projectId}`);
}

export function listProjectTeam(projectId: string) {
  return apiGet<ProjectTeamMemberRead[]>(`/projects/${projectId}/team`);
}

export function addProjectTeamMember(
  projectId: string,
  payload: { user_id: string; member_role: ProjectMemberRole },
) {
  return apiPost<ProjectTeamMemberRead>(`/projects/${projectId}/team`, payload);
}

export function updateProjectTeamMember(
  projectId: string,
  userId: string,
  payload: { member_role: ProjectMemberRole },
) {
  return apiPatch<ProjectTeamMemberRead>(`/projects/${projectId}/team/${userId}`, payload);
}

export function removeProjectTeamMember(projectId: string, userId: string) {
  return apiDelete<MessageResponse>(`/projects/${projectId}/team/${userId}`);
}

export function listProjectSources(projectId: string) {
  return apiGet<ProjectSourceSelectionRead[]>(`/projects/${projectId}/sources?skip=0&limit=50`);
}

export function addProjectSource(projectId: string, payload: ProjectSourceSelectionCreate) {
  return apiPost<ProjectSourceSelectionRead>(`/projects/${projectId}/sources`, payload);
}

export function deleteProjectSource(projectId: string, sourceSelectionId: string) {
  return apiDelete<MessageResponse>(`/projects/${projectId}/sources/${sourceSelectionId}`);
}

export function listProjectWorkflows(projectId: string) {
  return apiGet<ProjectWorkflowRead[]>(`/projects/${projectId}/workflows?skip=0&limit=50`);
}

export function createProjectWorkflow(projectId: string, payload: ProjectWorkflowCreate) {
  return apiPost<ProjectWorkflowRead>(`/projects/${projectId}/workflows`, payload);
}

export function updateProjectWorkflow(workflowId: string, payload: Partial<ProjectWorkflowCreate>) {
  return apiPatch<ProjectWorkflowRead>(`/workflows/${workflowId}`, payload);
}

export function listWorkflowSteps(workflowId: string) {
  return apiGet<ProjectWorkflowStepRead[]>(`/workflows/${workflowId}/steps?skip=0&limit=50`);
}

export function createWorkflowStep(workflowId: string, payload: ProjectWorkflowStepCreate) {
  return apiPost<ProjectWorkflowStepRead>(`/workflows/${workflowId}/steps`, payload);
}

export function updateWorkflowStep(
  stepId: string,
  payload: Partial<ProjectWorkflowStepCreate>,
) {
  return apiPatch<ProjectWorkflowStepRead>(`/workflow-steps/${stepId}`, payload);
}

export function deleteWorkflowStep(stepId: string) {
  return apiDelete<MessageResponse>(`/workflow-steps/${stepId}`);
}

export function listProjectOutputs(projectId: string) {
  return apiGet<AgentOutputRead[]>(`/projects/${projectId}/outputs?skip=0&limit=50`);
}

export function createProjectOutput(projectId: string, payload: AgentOutputCreate) {
  return apiPost<AgentOutputRead>(`/projects/${projectId}/outputs`, payload);
}

export function updateProjectOutput(outputId: string, payload: Partial<AgentOutputCreate>) {
  return apiPatch<AgentOutputRead>(`/outputs/${outputId}`, payload);
}

export function deleteProjectOutput(outputId: string) {
  return apiDelete<MessageResponse>(`/outputs/${outputId}`);
}

export function listTasks() {
  return apiGet<TaskRead[]>("/tasks?skip=0&limit=100");
}

export function createProjectConversation(projectId: string, title: string) {
  return apiPost<ConversationRead>(`/projects/${projectId}/conversations`, { title });
}

export function addProjectConversationMessage(
  conversationId: string,
  payload: {
    sender_type: ConversationMessageRead["sender_type"];
    content: string;
    source_refs?: Record<string, unknown> | null;
    thought_chain_refs?: Record<string, unknown> | null;
  },
) {
  return apiPost<ConversationMessageRead>(`/conversations/${conversationId}/messages`, payload);
}

export function listAdminUsers() {
  return apiGet<UserRead[]>("/admin/users?skip=0&limit=100");
}
