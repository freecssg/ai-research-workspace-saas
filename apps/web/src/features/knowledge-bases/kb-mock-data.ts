// Frontend-only generated content placeholders. The Module 1 backend stores
// control-plane records but intentionally does not expose LLM Wiki/Graph RAG
// generated-content endpoints yet.

export const generatedWikiSections = [
  {
    id: "neural-architecture",
    label: "1. Neural Architecture",
    children: ["1.1 Attention Mechanisms", "1.2 Transformer Models", "1.3 Latent Diffusion"],
  },
  {
    id: "optimization-theory",
    label: "2. Optimization Theory",
    children: [],
  },
  {
    id: "empirical-results",
    label: "3. Empirical Results",
    children: [],
  },
];

export const generatedArticle = {
  badge: "Synthesized",
  title: "Latent Diffusion Models in High-Dimensional Synthesis",
  updatedLabel: "Last updated 2 hours ago",
  intro:
    "The evolution of generative models has recently shifted toward latent space diffusion, offering significant computational advantages over pixel-space approaches. This synthesis draws primarily from recent literature on denoising diffusion probabilistic models and follow-up studies.",
  quote:
    "By decomposing the image formation process into a sequential application of denoising autoencoders, diffusion models achieve state-of-the-art synthesis results.",
  sectionTitle: "1.3.1 Core Mechanism",
  bullets: [
    "Perceptual Compression: An autoencoder is trained to provide a low-dimensional representational space that is perceptually equivalent to the data space.",
    "Latent Diffusion: A DDPM is trained to generate in this latent space, guided by cross-attention mechanisms conditioning on text, images, or semantic maps.",
  ],
  insight:
    "When comparing this architecture to VQ-VAEs utilized in discrete diffusion, the continuous latent space of LDMs allows for more fluid semantic interpolation, though it comes with a trade-off in reconstruction precision.",
};

export const graphThoughtChain = {
  question: "How does quantum entanglement resolve the locality issue in the EPR setup?",
  nodeTitle: "EPR Paradox",
  nodeDescription:
    "The Einstein-Podolsky-Rosen paradox is a thought experiment in quantum mechanics intended to expose relationships between locality, measurement, and hidden variables.",
  tags: ["Theory", "1935"],
  messages: [
    {
      sender: "assistant",
      content:
        "Entanglement does not allow faster-than-light communication, which preserves relativity. However, the correlation between the two particles is instantaneous upon measurement.",
    },
    {
      sender: "user",
      content:
        "Show me the specific paper by Bell that addresses this mathematical inequality.",
    },
  ],
};

export const contextualNotes = [
  {
    title: "Bell's Theorem (1964)",
    summary: "\"On the Einstein Podolsky Rosen paradox\" - Physics Physique Fizika.",
    kind: "Core",
    tone: "red" as const,
  },
  {
    title: "Aspect Experiment Notes",
    summary: "Experimental tests of Bell inequalities using time-varying analyzers.",
    kind: "Data",
    tone: "blue" as const,
  },
  {
    title: "Local Hidden Variables",
    summary: "Summary of theories positing undiscovered parameters.",
    kind: "Concept",
    tone: "amber" as const,
  },
];
