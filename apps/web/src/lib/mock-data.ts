import type { ComponentType } from "react";
import { Database, FileText, Folder } from "lucide-react";

export type SummaryCardItem = {
  label: string;
  count: string;
};

export type SummaryCard = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  maturityLabel: string;
  maturityValue: string;
  capacityLabel: string;
  capacityValue: string;
  progress: number;
  items: SummaryCardItem[];
  createLabel: string;
  viewHref: string;
};

export const dashboardSummaryCards: SummaryCard[] = [
  {
    title: "Knowledge Base",
    icon: Database,
    maturityLabel: "Maturity",
    maturityValue: "156 papers analyzed",
    capacityLabel: "Capacity",
    capacityValue: "200 papers",
    progress: 78,
    items: [
      { label: "Cognitive Psychology", count: "KB" },
      { label: "Quantum Computing", count: "KB" },
      { label: "HCI Trends", count: "KB" },
    ],
    createLabel: "Create KB",
    viewHref: "/knowledge-bases",
  },
  {
    title: "Workspaces",
    icon: Folder,
    maturityLabel: "Maturity",
    maturityValue: "45 papers analyzed",
    capacityLabel: "Capacity",
    capacityValue: "60 papers",
    progress: 75,
    items: [
      { label: "Literature Review", count: "WS" },
      { label: "User Study A", count: "WS" },
      { label: "Data Analysis", count: "WS" },
    ],
    createLabel: "New Workspace",
    viewHref: "/workspaces",
  },
  {
    title: "Projects",
    icon: FileText,
    maturityLabel: "Maturity",
    maturityValue: "12 papers analyzed",
    capacityLabel: "Capacity",
    capacityValue: "20 papers",
    progress: 60,
    items: [
      { label: "Audit Coherence", count: "PR" },
      { label: "Attention Models", count: "PR" },
      { label: "Touch Interfaces", count: "PR" },
    ],
    createLabel: "New Project",
    viewHref: "/projects",
  },
];

export const knowledgeBaseRows = [
  {
    title: "Quantum Computing Protocols",
    id: "KB-2023-0012",
    type: "RAG",
    author: "Dr. E. Schmidt",
    createdAt: "Oct 12, 2023",
    updatedAt: "Nov 05, 2023",
    status: "2 workspaces, 80 papers",
    progress: 58,
  },
  {
    title: "Neuroplasticity Review 2024",
    id: "KB-2023-0009",
    type: "LLM Wiki",
    author: "Prof. L. Chen",
    createdAt: "Sep 28, 2023",
    updatedAt: "Nov 04, 2023",
    status: "1 workspace, 45 papers",
    progress: 45,
  },
];

// Mock-only dashboard aggregate metrics. The current backend exposes entity lists
// but does not yet expose paper/source-material count aggregates for dashboard
// progress bars. Keep these isolated so they can be replaced by a summary API.
export const dashboardMockAggregateMetrics = {
  knowledgeBases: {
    analyzedLabel: "156 papers analyzed",
    capacityLabel: "200 papers",
    progress: 78,
  },
  workspaces: {
    analyzedLabel: "45 papers analyzed",
    capacityLabel: "60 papers",
    progress: 75,
  },
  projects: {
    analyzedLabel: "12 papers analyzed",
    capacityLabel: "20 papers",
    progress: 60,
  },
};
