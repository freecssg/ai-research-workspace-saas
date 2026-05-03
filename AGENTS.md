# AGENTS.md

## Project Name

AI Research Workspace SaaS

## Product Context

This repository implements Module 1 of a larger AI Research Assistant system.

The full system will eventually contain four independent modules:

1. Research Workspace SaaS
2. LLM Wiki Builder
3. Graph RAG Builder
4. Multi-Agent Research Workflow Engine based on LangChain/LangGraph

This repository is only responsible for Module 1: Research Workspace SaaS.

The SaaS module manages users, workspaces, projects, uploaded files, knowledge bases, background tasks, and generated research outputs. It should provide the UI and API control layer for the other modules, but it should not implement the full LLM Wiki, Graph RAG, or multi-agent logic directly.

## Corrected Product Model

This system is a local research-lab AI Research Assistant.

It is not a public SaaS product in the MVP stage.

The system helps Ph.D. students and professors quickly understand background knowledge, theoretical development paths, latest research trends, and research gaps. Users should focus on research ideas and creative concepts instead of repeatedly organizing documents or searching citations.

### Core Hierarchy

The correct hierarchy is:

```text
KnowledgeBase
  -> Workspace / Topic Space
       -> SourceMaterial
       -> AIAnalysisAgentConfig
       -> ThoughtChain
       -> Conversation

Project
  -> ProjectTeamMember
  -> ProjectSourceSelection
  -> ProjectWorkflow
  -> ProjectWorkflowStep
  -> AgentOutput

## Primary Goal

Build a production-quality MVP foundation for the Research Workspace SaaS.

User Path 1: Build a new Knowledge Base

Goal:

Build a theoretical foundation for future research.

Flow:

1. Professor or researcher creates a new Knowledge Base.
2. User defines the research domain.
3. User uploads or links public materials:
   - papers
   - datasets
   - benchmark pages
   - public reports
   - public documentation
4. User selects or configures AI analysis agents.
5. AI agents analyze the materials.
6. System generates:
   - LLM Wiki
   - citation-backed summaries
   - concept relationships
   - method relationships
   - dataset relationships
   - theoretical development paths
7. User discusses the generated knowledge base with AI.
8. System records conversation and thought chains.

Important UX rule:

Users do not manually edit generated wiki nodes.
Users guide, discuss, review, and define thought chains.

User Path 2: Create a topic Workspace inside a Knowledge Base

Goal:

Focus the knowledge base around a specific research topic.

Flow:

1. User opens a Knowledge Base.
2. User creates a Workspace / Topic Space.
3. User defines the topic or research direction.
4. User selects relevant source materials from the Knowledge Base.
5. User may add private research materials:
   - notes
   - draft ideas
   - datasets
   - experiment outputs
   - transcripts
6. User selects AI agents for this workspace.
7. AI agents analyze the selected materials.
8. System creates topic-specific:
   - LLM Wiki subset
   - RAG index
   - graph relationships
   - topic summary
   - research gaps
   - method/data/theory mapping
9. User discusses the topic with AI.
10. System records the topic thought chain.

Important UX rule:

Workspace content is AI-generated and AI-maintained.
Users manage agent configuration and reasoning direction, not low-level nodes.

User Path 3: Discuss knowledge and define thought chains

Goal:

Clarify research questions and directions through AI-assisted discussion.

Flow:

1. User opens a Knowledge Base or Workspace.
2. User starts a discussion with AI.
3. User asks about:
   - background knowledge
   - theory evolution
   - latest trends
   - research gaps
   - method comparison
   - dataset relevance
   - logical relationship between topics
4. AI answers with citations and links to knowledge base content.
5. User marks useful reasoning paths.
6. System records these reasoning paths as Thought Chains.
7. Thought Chains can later be selected as source logic in Projects.

Thought chains are important because they represent the user’s intellectual contribution.

They should record:

- User question and the sequency of these questions
- AI answer
- Referenced sources
- Related concepts
- Related methods
- Related datasets
- User annotations
- Logical claims
- Follow-up questions
- Relationship to research direction

User Path 4: Manage AI analysis agents

Goal:

Let users control how AI analyzes papers, datasets, and research materials.

Flow:

1. User opens a Knowledge Base or Workspace.
2. User opens Agent Management.
3. User selects agent type:
   - paper analysis agent
   - dataset analysis agent
   - theory extraction agent
   - method comparison agent
   - citation analysis agent
   - trend analysis agent
4. User configures:
   - analysis goal
   - target material type
   - output format
   - extraction schema
   - citation requirements
5. Agent processes selected materials.
6. System updates the Knowledge Base or Workspace.
7. User reviews AI-generated analysis summary.

Important UX rule:

Users manage the agent behavior.
Users do not directly edit the knowledge graph or wiki nodes.

User Path 5: Create an output Project

Goal:

Generate an academic output using selected knowledge and data.

Flow:

1. User creates a Project.
2. User selects output objective:
   - literature review
   - REB application
   - data report
   - presentation
   - manuscript section
   - research proposal
3. User selects source materials:
   - Knowledge Base sections
   - Workspaces
   - Papers
   - Datasets
   - Thought Chains
   - Previous outputs
4. User defines output requirements:
   - academic style
   - citation style
   - target length
   - workflow template
   - evaluation criteria
5. AI generates a workflow.
6. Project team members can edit workflow steps.
7. AI produces draft outputs.
8. Team reviews and revises outputs.
9. System checks:
   - citation coverage
   - logical consistency
   - source alignment
   - missing evidence
10. Final output is exported.

Important UX rule:
Projects are editable by project team members.
Knowledge Base and Workspace generated content is not directly edited by users.


## Tech Stack

Use the following stack unless explicitly instructed otherwise:

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query if useful

### Backend

- FastAPI
- Python 3.11+
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- PostgreSQL
- Redis
- Celery

### Infrastructure

- Docker Compose
- PostgreSQL container
- Redis container
- Local file storage for MVP

## Repository Structure

Use this structure:

```text
apps/
  web/
    src/
      app/
      components/
      features/
      lib/
      styles/
  api/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
      workers/
      main.py

packages/
  shared/
    schemas/
    types/

infra/
  docker/
    docker-compose.yml

docs/
  architecture.md
  api-contract.md
  development-plan.md

## Frontend Design Implementation Rules

The frontend must be implemented strictly according to the uploaded UI design screenshots and design documents.

### Design Fidelity

- Treat uploaded UI screenshots as the visual source of truth.
- Match layout, spacing, typography, color, border radius, shadows, icons, button styles, and component hierarchy as closely as possible.
- Do not redesign pages unless explicitly asked.
- Do not introduce new visual styles that are not present in the provided design.
- Keep all pages visually consistent with the existing Research Workspace SaaS design system.

### UI Style Direction

The product should feel like a clean, modern research workspace SaaS.

Use:
- Soft neutral backgrounds.
- Minimal borders.
- Consistent card styling.
- Consistent primary action buttons.
- Consistent secondary buttons.
- Consistent icon style.
- Clear page headers.
- Clear empty states.
- Spacious layouts.
- Professional academic/research product tone.

Avoid:
- Heavy borders.
- Random gradients.
- Inconsistent icons.
- Inconsistent button colors.
- Dense layouts.
- Overly decorative UI.
- Unapproved animations.
- Unnecessary redesigns.

### Frontend Stack

Use:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- lucide-react icons unless the design specifies otherwise

### Component Rules

Create reusable components for:
- App shell
- Sidebar
- Top navigation
- Page header
- Section header
- Stats card
- Workspace card
- Project card
- File table
- Knowledge base card
- Task status badge
- Output card
- Empty state
- Form field
- Primary button
- Secondary button
- Icon button

Do not duplicate UI patterns across pages if a reusable component is appropriate.

### Page Implementation Rules

For every page:
- Match the uploaded design.
- Preserve responsive behavior.
- Use real route structure from AGENTS.md.
- Use mock data only when backend integration is not ready.
- Keep mock data isolated so it can be replaced by API calls later.
- Do not change backend files unless the prompt explicitly asks for it.

### Verification Requirements

After implementing each page or page group:
- Run the frontend type check if available.
- Run linting if available.
- Start the dev server if possible.
- Review the page against the uploaded design.
- Summarize any differences or assumptions.
