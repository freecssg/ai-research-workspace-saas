import type { WorkflowType } from "./project-api";

export const workflowTabs: { label: string; type: WorkflowType }[] = [
  { label: "Literature Review", type: "literature_review" },
  { label: "REB", type: "reb_application" },
  { label: "Data Process", type: "data_analysis" },
  { label: "Result Presentation", type: "presentation" },
  { label: "Manuscript", type: "manuscript" },
  { label: "Custom", type: "custom" },
];

export const workflowTemplates = [
  {
    name: "PRISMA Workflow",
    type: "literature_review" as const,
    description: "Screen, summarize, and synthesize literature with traceable exclusions.",
  },
  {
    name: "Scoping Review",
    type: "literature_review" as const,
    description: "Map topic breadth, source clusters, and early research gaps.",
  },
  {
    name: "REB Preparation",
    type: "reb_application" as const,
    description: "Prepare ethics application sections and consistency checks.",
  },
  {
    name: "Data Analysis Plan",
    type: "data_analysis" as const,
    description: "Move from source datasets to analysis report sections.",
  },
];

export const starterWorkflowSteps = [
  {
    name: "Search Corpus",
    description: "Collect candidate sources from selected Knowledge Bases and Workspaces.",
    agent_type: "paper_analysis" as const,
  },
  {
    name: "Summarize Evidence",
    description: "Extract key findings, methods, and limitation notes.",
    agent_type: "method_extraction" as const,
  },
  {
    name: "Draft Output",
    description: "Create an editable project output draft from selected evidence.",
    agent_type: "custom" as const,
  },
];

export const projectSourceBrowserHint = {
  title: "Source browser is composed client-side",
  description:
    "The backend exposes Knowledge Base, Workspace, SourceMaterial, and ThoughtChain list endpoints separately. This selector uses those endpoints instead of a global source browser API.",
};

export const mockWorkflowCanvasNodes = [
  {
    title: "ArXiv Database",
    subtitle: "Query",
    body: "Transformer models efficiency",
    kind: "data",
  },
  {
    title: "Summarizer Agent",
    subtitle: "Model",
    body: "Extract key findings",
    kind: "agent",
  },
];
