// Frontend-only generated workspace synthesis placeholders. Module 1 stores
// workspace records and control-plane data, but generated wiki/RAG/graph
// content is produced by later modules and is intentionally mocked here.

export const workspaceTemplates = [
  {
    key: "theory",
    name: "Theory",
    researchTopic: "Foundational theory and conceptual background",
    description:
      "Curated milestone papers, foundational books, and core theoretical frameworks.",
    tone: "blue" as const,
  },
  {
    key: "study",
    name: "Study",
    researchTopic: "Empirical studies and peer-reviewed evidence",
    description:
      "Peer-reviewed research and related papers from top-tier academic conferences and journals.",
    tone: "green" as const,
  },
  {
    key: "frontiers",
    name: "Frontiers",
    researchTopic: "Emerging work, preprints, and frontier signals",
    description: "Recent preprints from arXiv, industry reports, and emerging digital content.",
    tone: "amber" as const,
  },
];

export const workspaceSynthesis = {
  label: "LLM Wiki Review",
  title: "Episodic Buffer Synthesis",
  subtitle: "Generated synthesis from 4 source documents - Last updated 2 hrs ago",
  sections: [
    {
      title: "Research Background",
      icon: "flask",
      body:
        "The concept of the episodic buffer was introduced by Baddeley (2000) as a fourth component of the working memory model, serving as a temporary store that integrates information from the phonological loop, visuospatial sketchpad, and long-term memory into a unitary episodic representation.",
      quote:
        "The episodic buffer represents a shift from focusing on the isolation of sub-systems to considering their integration, highlighting the role of working memory in conscious awareness.",
    },
    {
      title: "Methodology",
      icon: "compass",
      body:
        "Recent studies employing dual-task paradigms and neuroimaging have attempted to isolate the binding process within the episodic buffer. Research has focused on visual feature integration and cross-modal binding.",
      bullets: [
        "Task A: Concurrent articulation during feature binding.",
        "Task B: Spatial tapping during cross-modal integration.",
      ],
    },
  ],
};

export const workspaceAgentCards = [
  {
    name: "Wiki Synthesis Bot",
    description: "Synthesizes selected papers into structured wiki formats.",
    model: "GPT-4 Turbo",
    status: "ready",
  },
  {
    name: "Relation Extractor",
    description: "Maps conceptual relationships between cited authors.",
    model: "Claude 3.5",
    status: "ready",
  },
];

export const workspaceGraph = {
  centerTitle: "Episodic Buffer",
  centerDescription:
    "Topic-level concept node generated from workspace source materials and Thought Chains.",
  related: ["Working Memory", "Binding", "Attention Control", "Long-Term Memory"],
};
