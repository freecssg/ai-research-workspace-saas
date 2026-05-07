import type { AuthUser } from "@/lib/auth-client";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";

export type MessageResponse = {
  detail: string;
};

export type KnowledgeBaseStatus = "draft" | "building" | "ready" | "failed" | "archived";

export type KnowledgeBaseRead = {
  id: string;
  name: string;
  description: string | null;
  research_domain: string;
  status: KnowledgeBaseStatus;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type KnowledgeBaseCreate = {
  name: string;
  research_domain: string;
  description?: string | null;
  status?: KnowledgeBaseStatus;
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

export type WorkspaceCreate = {
  name: string;
  description?: string | null;
  research_topic: string;
  status?: WorkspaceRead["status"];
};

export type SourceMaterialRead = {
  id: string;
  knowledge_base_id: string;
  workspace_id: string | null;
  title: string;
  original_filename: string | null;
  storage_path: string | null;
  source_kind:
    | "paper"
    | "dataset"
    | "note"
    | "transcript"
    | "report"
    | "webpage"
    | "experiment_result"
    | "other";
  visibility: "public" | "private" | "lab_internal";
  content_type: string | null;
  file_size: number | null;
  source_url: string | null;
  citation_metadata: Record<string, unknown> | null;
  processing_status: "uploaded" | "queued" | "processing" | "analyzed" | "indexed" | "failed";
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type AIAnalysisAgentConfigRead = {
  id: string;
  knowledge_base_id: string | null;
  workspace_id: string | null;
  name: string;
  agent_type:
    | "paper_analysis"
    | "dataset_analysis"
    | "method_extraction"
    | "theory_mapping"
    | "citation_analysis"
    | "trend_analysis"
    | "rag_indexing"
    | "graph_building"
    | "custom";
  description: string | null;
  target_source_kind: SourceMaterialRead["source_kind"] | null;
  analysis_goal: string | null;
  extraction_schema: Record<string, unknown> | null;
  output_format: string | null;
  is_active: boolean;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type AIAnalysisAgentConfigCreate = {
  name: string;
  agent_type: AIAnalysisAgentConfigRead["agent_type"];
  description?: string | null;
  target_source_kind?: SourceMaterialRead["source_kind"] | null;
  analysis_goal?: string | null;
  extraction_schema?: Record<string, unknown> | null;
  output_format?: string | null;
  is_active?: boolean;
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

export type ThoughtChainCreate = {
  title: string;
  description?: string | null;
  chain_type: ThoughtChainRead["chain_type"];
  content: Record<string, unknown>;
};

export type ConversationRead = {
  id: string;
  knowledge_base_id: string | null;
  workspace_id: string | null;
  project_id: string | null;
  title: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type ConversationMessageRead = {
  id: string;
  conversation_id: string;
  sender_type: "user" | "assistant" | "system" | "agent";
  content: string;
  source_refs: Record<string, unknown> | null;
  thought_chain_refs: Record<string, unknown> | null;
  created_at: string;
};

export function getCurrentUser() {
  return apiGet<AuthUser>("/auth/me");
}

export function listKnowledgeBases() {
  return apiGet<KnowledgeBaseRead[]>("/knowledge-bases?skip=0&limit=50");
}

export function createKnowledgeBase(payload: KnowledgeBaseCreate) {
  return apiPost<KnowledgeBaseRead>("/knowledge-bases", payload);
}

export function getKnowledgeBase(kbId: string) {
  return apiGet<KnowledgeBaseRead>(`/knowledge-bases/${kbId}`);
}

export function updateKnowledgeBase(kbId: string, payload: Partial<KnowledgeBaseCreate>) {
  return apiPatch<KnowledgeBaseRead>(`/knowledge-bases/${kbId}`, payload);
}

export function deleteKnowledgeBase(kbId: string) {
  return apiDelete<MessageResponse>(`/knowledge-bases/${kbId}`);
}

export function listKnowledgeBaseWorkspaces(kbId: string) {
  return apiGet<WorkspaceRead[]>(`/knowledge-bases/${kbId}/workspaces?skip=0&limit=50`);
}

export function createKnowledgeBaseWorkspace(kbId: string, payload: WorkspaceCreate) {
  return apiPost<WorkspaceRead>(`/knowledge-bases/${kbId}/workspaces`, payload);
}

export function getWorkspace(workspaceId: string) {
  return apiGet<WorkspaceRead>(`/workspaces/${workspaceId}`);
}

export function updateWorkspace(workspaceId: string, payload: Partial<WorkspaceCreate>) {
  return apiPatch<WorkspaceRead>(`/workspaces/${workspaceId}`, payload);
}

export function deleteWorkspace(workspaceId: string) {
  return apiDelete<MessageResponse>(`/workspaces/${workspaceId}`);
}

export function listKnowledgeBaseMaterials(kbId: string) {
  return apiGet<SourceMaterialRead[]>(`/knowledge-bases/${kbId}/materials?skip=0&limit=50`);
}

export function createKnowledgeBaseMaterial(kbId: string, formData: FormData) {
  return apiPost<SourceMaterialRead>(`/knowledge-bases/${kbId}/materials`, formData);
}

export function listWorkspaceMaterials(workspaceId: string) {
  return apiGet<SourceMaterialRead[]>(`/workspaces/${workspaceId}/materials?skip=0&limit=50`);
}

export function createWorkspaceMaterial(workspaceId: string, formData: FormData) {
  return apiPost<SourceMaterialRead>(`/workspaces/${workspaceId}/materials`, formData);
}

export function deleteSourceMaterial(materialId: string) {
  return apiDelete<MessageResponse>(`/materials/${materialId}`);
}

export function listKnowledgeBaseAgents(kbId: string) {
  return apiGet<AIAnalysisAgentConfigRead[]>(`/knowledge-bases/${kbId}/agents?skip=0&limit=50`);
}

export function createKnowledgeBaseAgent(kbId: string, payload: AIAnalysisAgentConfigCreate) {
  return apiPost<AIAnalysisAgentConfigRead>(`/knowledge-bases/${kbId}/agents`, payload);
}

export function listWorkspaceAgents(workspaceId: string) {
  return apiGet<AIAnalysisAgentConfigRead[]>(`/workspaces/${workspaceId}/agents?skip=0&limit=50`);
}

export function createWorkspaceAgent(workspaceId: string, payload: AIAnalysisAgentConfigCreate) {
  return apiPost<AIAnalysisAgentConfigRead>(`/workspaces/${workspaceId}/agents`, payload);
}

export function updateAgent(agentId: string, payload: Partial<AIAnalysisAgentConfigCreate>) {
  return apiPatch<AIAnalysisAgentConfigRead>(`/agents/${agentId}`, payload);
}

export function deleteAgent(agentId: string) {
  return apiDelete<MessageResponse>(`/agents/${agentId}`);
}

export function listKnowledgeBaseThoughtChains(kbId: string) {
  return apiGet<ThoughtChainRead[]>(
    `/knowledge-bases/${kbId}/thought-chains?skip=0&limit=50`,
  );
}

export function createKnowledgeBaseThoughtChain(kbId: string, payload: ThoughtChainCreate) {
  return apiPost<ThoughtChainRead>(`/knowledge-bases/${kbId}/thought-chains`, payload);
}

export function listWorkspaceThoughtChains(workspaceId: string) {
  return apiGet<ThoughtChainRead[]>(
    `/workspaces/${workspaceId}/thought-chains?skip=0&limit=50`,
  );
}

export function createWorkspaceThoughtChain(workspaceId: string, payload: ThoughtChainCreate) {
  return apiPost<ThoughtChainRead>(`/workspaces/${workspaceId}/thought-chains`, payload);
}

export function updateThoughtChain(thoughtChainId: string, payload: Partial<ThoughtChainCreate>) {
  return apiPatch<ThoughtChainRead>(`/thought-chains/${thoughtChainId}`, payload);
}

export function deleteThoughtChain(thoughtChainId: string) {
  return apiDelete<MessageResponse>(`/thought-chains/${thoughtChainId}`);
}

export function createKnowledgeBaseConversation(kbId: string, title: string) {
  return apiPost<ConversationRead>(`/knowledge-bases/${kbId}/conversations`, { title });
}

export function createWorkspaceConversation(workspaceId: string, title: string) {
  return apiPost<ConversationRead>(`/workspaces/${workspaceId}/conversations`, { title });
}

export function getConversation(conversationId: string) {
  return apiGet<ConversationRead>(`/conversations/${conversationId}`);
}

export function addConversationMessage(
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
