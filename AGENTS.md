# AGENTS.md

## Project Name

AI Research Workspace SaaS

## Product Context

This repository implements **Module 1: Research Workspace SaaS** of a larger AI Research Assistant system.

The full system will eventually contain four independent modules:

1. Research Workspace SaaS
2. LLM Wiki Builder
3. Graph RAG Builder
4. Multi-Agent Research Workflow Engine based on LangChain/LangGraph

This repository is responsible only for **Module 1**.

Module 1 provides the local research-lab application layer for:

- user/account management
- knowledge base management
- topic workspace management
- source material management
- AI analysis agent configuration
- thought-chain and conversation recording
- output-oriented research project workflows
- task tracking
- generated output management

This module should provide the UI and API control layer for the other modules, but it should **not** directly implement the full LLM Wiki, Graph RAG, or multi-agent workflow logic.

The other modules should later be integrated through clear API, CLI, task, and file-based contracts.

---

## Corrected Product Model

This system is a **local research-lab AI Research Assistant**.

It is **not** a public SaaS product in the MVP stage.

The system helps Ph.D. students, professors, and research assistants quickly understand:

- background knowledge
- theoretical development paths
- latest research trends
- research gaps
- method relationships
- data-theory relationships
- citation-supported arguments

Users should spend less time repeatedly organizing documents, searching citations, and reconstructing theoretical context. They should spend more time developing research ideas, clarifying research questions, discussing arguments with AI, and creating new concepts.

---

## Core Concept Hierarchy

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
```

### Concept Rules

- **KnowledgeBase** is the top-level research knowledge foundation.
- **Workspace** is a topic-specific subset of a KnowledgeBase.
- **Project** is output-oriented and uses selected materials from KnowledgeBases, Workspaces, SourceMaterials, ThoughtChains, and previous outputs.
- Projects do **not** own KnowledgeBases or Workspaces.
- Users do **not** directly edit AI-generated knowledge nodes, wiki nodes, graph nodes, or RAG structures.
- Users guide the system by selecting materials, configuring AI agents, discussing with AI, and defining ThoughtChains.
- KnowledgeBase and Workspace content is generated and maintained by AI agents.
- Project workflow and outputs can be edited by project team members.

---

## Core Product Concepts

### KnowledgeBase

A KnowledgeBase is the highest-level research knowledge container.

Its purpose is to build a theoretical and methodological foundation for future research.

A KnowledgeBase may contain:

- public papers
- public datasets
- benchmark information
- public reports
- documentation
- AI-generated LLM Wiki pages
- citation-backed summaries
- concept relationships
- method relationships
- dataset relationships
- theory development paths
- trend summaries
- research gap summaries
- thought chains
- conversations
- AI analysis agent configurations

Users can:

- create KnowledgeBases
- upload or link source materials
- configure AI analysis agents
- discuss KnowledgeBase content with AI
- define ThoughtChains
- review AI-generated summaries and analysis results

Users should not directly edit generated wiki nodes, graph nodes, or low-level RAG structures.

---

### Workspace / Topic Space

A Workspace is a topic-specific subset of a KnowledgeBase.

Each Workspace corresponds to a specific research topic, research direction, theoretical area, data domain, or methodological focus.

A Workspace may contain:

- selected source materials from its parent KnowledgeBase
- topic-specific papers
- notes
- datasets
- experiment results
- transcripts
- AI-generated summaries
- topic-specific LLM Wiki subsets
- topic-specific RAG indexes
- topic-specific graph relationships
- workspace-level ThoughtChains
- workspace-level Conversations
- workspace-level AI analysis agent configurations

Users can:

- create Workspaces inside KnowledgeBases
- define research topics
- add or select source materials
- configure workspace-level AI analysis agents
- discuss topic content with AI
- define topic-specific ThoughtChains
- review generated topic analysis

Users should not manually edit AI-generated workspace content or low-level graph/wiki/RAG nodes.

---

### SourceMaterial

SourceMaterial replaces the old generic `File` concept.

A SourceMaterial represents any research material that can be analyzed by AI.

Examples:

- paper
- dataset
- note
- transcript
- report
- webpage
- experiment result
- benchmark page
- documentation
- other research artifact

SourceMaterial can belong to:

- a KnowledgeBase
- a Workspace
- or both

---

### AIAnalysisAgentConfig

AIAnalysisAgentConfig defines how AI agents analyze source materials.

Agents may be configured at the KnowledgeBase or Workspace level.

Agent types include:

- paper analysis
- dataset analysis
- method extraction
- theory mapping
- citation analysis
- trend analysis
- RAG indexing
- graph building
- custom analysis

Users manage agent behavior but do not directly edit generated wiki or graph nodes.

---

### ThoughtChain

A ThoughtChain records a logical reasoning path developed through user-AI discussion.

ThoughtChains are important because they represent the researcher's intellectual contribution.

A ThoughtChain may include:

- user questions and the sequence of those questions
- AI answers
- referenced sources
- related concepts
- related methods
- related datasets
- user annotations
- logical claims
- follow-up questions
- relationships to research direction
- links to conversations
- links to selected source materials

ThoughtChains can later be selected as source logic for Projects.

---

### Conversation

A Conversation stores discussions between users and AI.

Conversations may be attached to:

- a KnowledgeBase
- a Workspace
- a Project

Conversation messages should preserve source references and ThoughtChain references when available.

---

### Project

A Project is defined by an output objective.

Examples:

- literature review
- REB / IRB application
- data analysis
- presentation
- manuscript section
- research proposal
- custom academic output

A Project selects sources from:

- KnowledgeBases
- Workspaces
- SourceMaterials
- ThoughtChains
- previous outputs

A Project manages:

- output objective
- source selection
- project team
- workflow
- workflow steps
- generated outputs
- citation checks
- consistency checks
- exportable results

Only project team members with appropriate roles can edit project workflows and outputs.

---

## Key User Paths

### User Path 1: Build a New KnowledgeBase

Goal: build a theoretical foundation for future research.

Flow:

1. Professor, researcher, or authorized user creates a KnowledgeBase.
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
7. User discusses the generated KnowledgeBase with AI.
8. System records Conversations and ThoughtChains.

Important UX rule:

- Users do not manually edit generated wiki nodes.
- Users guide, discuss, review, and define ThoughtChains.

---

### User Path 2: Create a Topic Workspace inside a KnowledgeBase

Goal: focus the KnowledgeBase around a specific research topic.

Flow:

1. User opens a KnowledgeBase.
2. User creates a Workspace / Topic Space.
3. User defines the topic or research direction.
4. User selects relevant source materials from the KnowledgeBase.
5. User may add private research materials:
   - notes
   - draft ideas
   - datasets
   - experiment outputs
   - transcripts
6. User selects or configures AI agents for this Workspace.
7. AI agents analyze the selected materials.
8. System creates topic-specific:
   - LLM Wiki subset
   - RAG index
   - graph relationships
   - topic summary
   - research gaps
   - method/data/theory mapping
9. User discusses the topic with AI.
10. System records the topic ThoughtChain.

Important UX rule:

- Workspace content is AI-generated and AI-maintained.
- Users manage agent configuration and reasoning direction, not low-level nodes.

---

### User Path 3: Discuss Knowledge and Define ThoughtChains

Goal: clarify research questions and research directions through AI-assisted discussion.

Flow:

1. User opens a KnowledgeBase or Workspace.
2. User starts a discussion with AI.
3. User asks about:
   - background knowledge
   - theory evolution
   - latest trends
   - research gaps
   - method comparison
   - dataset relevance
   - logical relationships between topics
4. AI answers with citations and links to KnowledgeBase or Workspace content.
5. User marks useful reasoning paths.
6. System records these reasoning paths as ThoughtChains.
7. ThoughtChains can later be selected as source logic in Projects.

---

### User Path 4: Manage AI Analysis Agents

Goal: let users control how AI analyzes papers, datasets, and research materials.

Flow:

1. User opens a KnowledgeBase or Workspace.
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
6. System updates the KnowledgeBase or Workspace.
7. User reviews AI-generated analysis summary.

Important UX rule:

- Users manage agent behavior.
- Users do not directly edit the knowledge graph, wiki nodes, or RAG internals.

---

### User Path 5: Create an Output Project

Goal: generate an academic output using selected knowledge and data.

Flow:

1. User creates a Project.
2. User selects output objective:
   - literature review
   - REB / IRB application
   - data report
   - presentation
   - manuscript section
   - research proposal
3. User selects source materials:
   - KnowledgeBase sections
   - Workspaces
   - papers
   - datasets
   - ThoughtChains
   - previous outputs
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

- Projects are editable by project team members.
- KnowledgeBase and Workspace generated content is not directly edited by users.

---

## Local Lab Deployment Model

This system will be deployed on a local server in a research lab.

Primary users:

- professor / administrator / team leader
- Ph.D. students
- research assistants
- collaborating researchers inside the same lab or research team

This system does not need public SaaS registration, billing, public onboarding, or complex organization management for the MVP.

---

## Authentication and Permissions

### Authentication

There is no public registration page.

The professor/admin creates accounts for students and lab members.

Admin-created accounts include:

- email
- name
- default password
- role
- active/inactive status

Users can:

- log in
- view their own account information
- change password if supported

### Roles

Use simple roles:

```text
admin
member
```

### Project Team Roles

Use project-level team roles:

```text
leader
editor
viewer
```

### Permission Rules

All authenticated users can read:

- KnowledgeBases
- Workspaces
- SourceMaterials
- ThoughtChains
- Conversations they are allowed to see
- Projects
- Project outputs

Admins can:

- create users
- update users
- deactivate or delete users
- create and manage KnowledgeBases
- create and manage Workspaces
- manage system-level or lab-level AI agent configurations

Authenticated users can:

- create Conversations
- add ConversationMessages
- create ThoughtChains
- create Projects

Project team members with `leader` or `editor` role can:

- edit project source selections
- edit project workflows
- edit workflow steps
- edit project outputs
- run project workflow tasks

Project team members with `viewer` role can:

- read project workflow details
- read outputs
- not edit workflows or outputs

Non-project members can:

- read projects
- view project outputs
- not edit workflows
- not modify selected sources
- not edit generated outputs

---

## Primary Goal

Build a production-quality MVP foundation for the Research Workspace SaaS.

The first milestone is a working local application where a user can:

1. Log in with an admin-created account.
2. View all KnowledgeBases.
3. Create a KnowledgeBase if authorized.
4. Create a Workspace inside a KnowledgeBase if authorized.
5. Add or upload SourceMaterials.
6. Configure AIAnalysisAgentConfigs.
7. Discuss KnowledgeBase or Workspace content with AI through Conversation records.
8. Create and view ThoughtChains.
9. Create an output-oriented Project.
10. Select KnowledgeBase, Workspace, SourceMaterial, and ThoughtChain sources for the Project.
11. Manage ProjectTeamMembers.
12. Edit ProjectWorkflow and ProjectWorkflowSteps if they are project team members.
13. View or edit AgentOutputs according to project permission.
14. View Task status.

---

## Tech Stack

Use the following stack unless explicitly instructed otherwise.

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query if useful
- lucide-react icons

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

---

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
  frontend-design-implementation-plan.md
```

---

## Domain Model

The backend domain model should include these entities.

### User

Fields:

- id
- email
- name
- hashed_password
- role: admin | member
- is_active
- created_at
- updated_at

### KnowledgeBase

Fields:

- id
- name
- description
- research_domain
- status: draft | building | ready | failed | archived
- created_by_id
- created_at
- updated_at

### Workspace

Fields:

- id
- knowledge_base_id
- name
- description
- research_topic
- status: draft | analyzing | ready | failed | archived
- created_by_id
- created_at
- updated_at

### SourceMaterial

Fields:

- id
- knowledge_base_id
- workspace_id nullable
- title
- original_filename nullable
- storage_path nullable
- source_kind: paper | dataset | note | transcript | report | webpage | experiment_result | other
- visibility: public | private | lab_internal
- content_type nullable
- file_size nullable
- source_url nullable
- citation_metadata json nullable
- processing_status: uploaded | queued | processing | analyzed | indexed | failed
- created_by_id
- created_at
- updated_at

### AIAnalysisAgentConfig

Fields:

- id
- knowledge_base_id nullable
- workspace_id nullable
- name
- agent_type: paper_analysis | dataset_analysis | method_extraction | theory_mapping | citation_analysis | trend_analysis | rag_indexing | graph_building | custom
- description nullable
- target_source_kind nullable
- analysis_goal nullable
- extraction_schema json nullable
- output_format nullable
- is_active
- created_by_id
- created_at
- updated_at

### ThoughtChain

Fields:

- id
- knowledge_base_id
- workspace_id nullable
- title
- description nullable
- chain_type: theory_path | method_relation | concept_relation | research_gap | research_question | argument_structure | data_theory_mapping | custom
- content json
- created_by_id
- created_at
- updated_at

### Conversation

Fields:

- id
- knowledge_base_id nullable
- workspace_id nullable
- project_id nullable
- title
- created_by_id
- created_at
- updated_at

### ConversationMessage

Fields:

- id
- conversation_id
- sender_type: user | assistant | system | agent
- content
- source_refs json nullable
- thought_chain_refs json nullable
- created_at

### Project

Fields:

- id
- name
- description
- output_objective
- project_type: literature_review | reb_application | data_analysis | presentation | manuscript | research_proposal | custom
- status: draft | active | completed | archived
- created_by_id
- created_at
- updated_at

### ProjectTeamMember

Fields:

- id
- project_id
- user_id
- member_role: leader | editor | viewer
- created_at
- updated_at

### ProjectSourceSelection

Fields:

- id
- project_id
- knowledge_base_id nullable
- workspace_id nullable
- source_material_id nullable
- thought_chain_id nullable
- selection_reason nullable
- created_by_id
- created_at
- updated_at

### ProjectWorkflow

Fields:

- id
- project_id
- name
- description nullable
- workflow_type: literature_review | reb_application | data_analysis | presentation | manuscript | custom
- status: draft | running | completed | failed | paused
- created_by_id
- created_at
- updated_at

### ProjectWorkflowStep

Fields:

- id
- workflow_id
- step_order
- name
- description nullable
- agent_type nullable
- status: pending | running | completed | failed | skipped
- input_refs json nullable
- output_refs json nullable
- created_at
- updated_at

### Task

Fields:

- id
- task_scope: knowledge_base | workspace | project | system
- knowledge_base_id nullable
- workspace_id nullable
- project_id nullable
- task_type: source_analysis | wiki_build | rag_index | graph_build | agent_run | workflow_run | citation_check | consistency_check
- status: queued | running | completed | failed | cancelled
- progress
- error_message nullable
- result_ref nullable
- created_by_id
- created_at
- updated_at

### AgentOutput

Fields:

- id
- project_id nullable
- knowledge_base_id nullable
- workspace_id nullable
- workflow_id nullable
- workflow_step_id nullable
- output_type: wiki_page | paper_summary | dataset_summary | method_summary | trend_summary | literature_review | reb_application | data_report | presentation_outline | manuscript_section | notes | custom
- title
- content
- source_refs json nullable
- source_task_id nullable
- created_by_id
- created_at
- updated_at

---

## API Requirements

Implement REST APIs under `/api/v1`.

### Health

```text
GET /health
```

### Authentication

```text
POST  /api/v1/auth/login
GET   /api/v1/auth/me
PATCH /api/v1/auth/change-password
```

Do not implement public registration.

### Admin User Management

```text
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/users/{user_id}
PATCH  /api/v1/admin/users/{user_id}
DELETE /api/v1/admin/users/{user_id}
```

### KnowledgeBases

```text
GET    /api/v1/knowledge-bases
POST   /api/v1/knowledge-bases
GET    /api/v1/knowledge-bases/{kb_id}
PATCH  /api/v1/knowledge-bases/{kb_id}
DELETE /api/v1/knowledge-bases/{kb_id}
```

### Workspaces

```text
GET    /api/v1/knowledge-bases/{kb_id}/workspaces
POST   /api/v1/knowledge-bases/{kb_id}/workspaces
GET    /api/v1/workspaces/{workspace_id}
PATCH  /api/v1/workspaces/{workspace_id}
DELETE /api/v1/workspaces/{workspace_id}
```

### SourceMaterials

```text
GET    /api/v1/knowledge-bases/{kb_id}/materials
POST   /api/v1/knowledge-bases/{kb_id}/materials
GET    /api/v1/workspaces/{workspace_id}/materials
POST   /api/v1/workspaces/{workspace_id}/materials
GET    /api/v1/materials/{material_id}
DELETE /api/v1/materials/{material_id}
```

### AIAnalysisAgentConfigs

```text
GET    /api/v1/knowledge-bases/{kb_id}/agents
POST   /api/v1/knowledge-bases/{kb_id}/agents
GET    /api/v1/workspaces/{workspace_id}/agents
POST   /api/v1/workspaces/{workspace_id}/agents
GET    /api/v1/agents/{agent_id}
PATCH  /api/v1/agents/{agent_id}
DELETE /api/v1/agents/{agent_id}
```

### ThoughtChains

```text
GET    /api/v1/knowledge-bases/{kb_id}/thought-chains
POST   /api/v1/knowledge-bases/{kb_id}/thought-chains
GET    /api/v1/workspaces/{workspace_id}/thought-chains
POST   /api/v1/workspaces/{workspace_id}/thought-chains
GET    /api/v1/thought-chains/{thought_chain_id}
PATCH  /api/v1/thought-chains/{thought_chain_id}
DELETE /api/v1/thought-chains/{thought_chain_id}
```

### Conversations

```text
GET  /api/v1/conversations/{conversation_id}
POST /api/v1/knowledge-bases/{kb_id}/conversations
POST /api/v1/workspaces/{workspace_id}/conversations
POST /api/v1/projects/{project_id}/conversations
POST /api/v1/conversations/{conversation_id}/messages
```

### Projects

```text
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{project_id}
PATCH  /api/v1/projects/{project_id}
DELETE /api/v1/projects/{project_id}
```

### Project Team

```text
GET    /api/v1/projects/{project_id}/team
POST   /api/v1/projects/{project_id}/team
PATCH  /api/v1/projects/{project_id}/team/{user_id}
DELETE /api/v1/projects/{project_id}/team/{user_id}
```

### Project Source Selections

```text
GET    /api/v1/projects/{project_id}/sources
POST   /api/v1/projects/{project_id}/sources
DELETE /api/v1/projects/{project_id}/sources/{source_selection_id}
```

### Project Workflows

```text
GET   /api/v1/projects/{project_id}/workflows
POST  /api/v1/projects/{project_id}/workflows
GET   /api/v1/workflows/{workflow_id}
PATCH /api/v1/workflows/{workflow_id}
```

### Project Workflow Steps

```text
GET    /api/v1/workflows/{workflow_id}/steps
POST   /api/v1/workflows/{workflow_id}/steps
PATCH  /api/v1/workflow-steps/{step_id}
DELETE /api/v1/workflow-steps/{step_id}
```

### Outputs

```text
GET    /api/v1/projects/{project_id}/outputs
POST   /api/v1/projects/{project_id}/outputs
GET    /api/v1/outputs/{output_id}
PATCH  /api/v1/outputs/{output_id}
DELETE /api/v1/outputs/{output_id}
```

### Tasks

```text
GET   /api/v1/tasks
GET   /api/v1/tasks/{task_id}
POST  /api/v1/tasks
PATCH /api/v1/tasks/{task_id}
```

---

## Frontend Route Structure

Use this route structure.

### Authentication

```text
/login
```

Do not create `/register`.

### Admin

```text
/admin/users
/admin/users/new
/admin/agents
```

### Dashboard

```text
/dashboard
```

### KnowledgeBase

```text
/knowledge-bases
/knowledge-bases/new
/knowledge-bases/[knowledgeBaseId]
/knowledge-bases/[knowledgeBaseId]/workspaces
/knowledge-bases/[knowledgeBaseId]/workspaces/new
/knowledge-bases/[knowledgeBaseId]/materials
/knowledge-bases/[knowledgeBaseId]/agents
/knowledge-bases/[knowledgeBaseId]/thought-chains
/knowledge-bases/[knowledgeBaseId]/conversations
```

### Workspace

```text
/workspaces/[workspaceId]
/workspaces/[workspaceId]/materials
/workspaces/[workspaceId]/agents
/workspaces/[workspaceId]/thought-chains
/workspaces/[workspaceId]/conversations
```

### Projects

```text
/projects
/projects/new
/projects/[projectId]
/projects/[projectId]/sources
/projects/[projectId]/workflow
/projects/[projectId]/outputs
/projects/[projectId]/team
/projects/[projectId]/conversations
```

---

## Frontend Design Implementation Rules

The frontend must be implemented strictly according to the uploaded UI design screenshots and design documents.

### Design Fidelity

- Treat uploaded UI screenshots as the visual source of truth.
- Match layout, spacing, typography, color, border radius, shadows, icons, button styles, and component hierarchy as closely as possible.
- Do not redesign pages unless explicitly asked.
- Do not introduce new visual styles that are not present in the provided design.
- Keep all pages visually consistent with the Research Workspace SaaS design system.
- Preserve the corrected product hierarchy in labels, navigation, and page layout.

### UI Style Direction

The product should feel like a clean, modern research workspace for a lab environment.

Use:

- soft neutral backgrounds
- minimal borders
- consistent card styling
- consistent primary action buttons
- consistent secondary buttons
- consistent icon style
- clear page headers
- clear empty states
- spacious layouts
- professional academic/research product tone

Avoid:

- heavy borders
- random gradients
- inconsistent icons
- inconsistent button colors
- dense layouts
- overly decorative UI
- unapproved animations
- unnecessary redesigns
- public SaaS marketing patterns

### Frontend Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- lucide-react icons unless the design specifies otherwise
- React Hook Form and Zod for forms
- TanStack Query if useful for API data fetching

### Component Rules

Create reusable components for:

- AppShell
- SidebarNav
- TopBar
- PageHeader
- SectionHeader
- StatsCard
- KnowledgeBaseCard
- WorkspaceCard
- SourceMaterialTable
- SourceMaterialUploadCard
- AgentConfigCard
- ThoughtChainCard
- ConversationPanel
- ProjectCard
- ProjectSourceSelector
- ProjectWorkflowView
- ProjectWorkflowStepCard
- ProjectTeamTable
- TaskStatusBadge
- OutputCard
- EmptyState
- FormField
- PrimaryButton
- SecondaryButton
- IconButton

Do not duplicate UI patterns across pages when a reusable component is appropriate.

### Page Implementation Rules

For every page:

- Match the uploaded design.
- Preserve responsive behavior.
- Use the route structure from this file.
- Use the corrected product model.
- Use mock data only when backend integration is not ready.
- Keep mock data isolated so it can be replaced by API calls later.
- Do not change backend files unless the prompt explicitly asks for it.

### Read-Only vs Editable UI Rules

KnowledgeBase and Workspace generated content should be presented as AI-generated and mostly read-only.

Users may interact with KnowledgeBase and Workspace pages by:

- adding or selecting source materials
- configuring AI analysis agents
- starting conversations
- creating ThoughtChains
- triggering analysis tasks

Users should not be offered direct editing controls for:

- generated wiki nodes
- generated graph nodes
- generated RAG chunks
- generated relationship edges

Project pages may allow editing when the current user is a project team member with `leader` or `editor` role.

### Verification Requirements

After implementing each page or page group:

- Run the frontend type check if available.
- Run linting if available.
- Start the dev server if possible.
- Review the page against the uploaded design.
- Summarize any differences or assumptions.

---

## Integration Boundaries

This repository should not directly implement the full logic for:

- LLM Wiki construction
- Graph RAG construction
- multi-agent academic workflow execution
- document intelligence pipelines
- embedding pipelines
- graph database construction

Instead, create placeholder service interfaces and task records for future integration.

Suggested placeholder clients:

```text
WikiBuilderClient
GraphRagClient
AgentWorkflowClient
```

Suggested methods:

```text
WikiBuilderClient.build_wiki(knowledge_base_id, material_ids)
GraphRagClient.build_index(workspace_id, material_ids)
AgentWorkflowClient.run_project_workflow(project_id, workflow_id)
```

When these actions are triggered in Module 1, create a `Task` record and return a placeholder result unless the real external module is integrated.

---

## Coding Standards

### General

- Keep the code modular and maintainable.
- Prefer clear names over clever abstractions.
- Avoid unnecessary abstractions in the MVP.
- Do not hardcode secrets.
- Use environment variables for configuration.
- Keep mock data isolated.
- Keep business logic out of route handlers and React page components when practical.

### Backend

- Use SQLAlchemy 2.x patterns.
- Use Pydantic v2 schemas.
- Use Alembic migrations for schema changes.
- Keep route handlers thin.
- Put business logic in service classes.
- Use dependency functions for:
  - current user
  - admin user
  - project edit permission
  - authenticated read access
- Use consistent error handling.
- Use simple pagination for list endpoints.
- Validate file uploads for allowed research material types.
- Do not implement real AI analysis logic in this repository.

### Frontend

- Use strict TypeScript.
- Use reusable components.
- Keep API calls in a dedicated client layer.
- Use centralized route constants if helpful.
- Use React Hook Form and Zod for non-trivial forms.
- Preserve design consistency across all pages.
- Do not introduce unrelated UI libraries unless necessary.

---

## Security Requirements

- Never commit `.env`.
- Use `.env.example` for required variables.
- Hash passwords.
- Do not expose secrets in frontend code.
- Validate uploaded file types.
- Limit upload size through configuration.
- Use authenticated routes.
- Remove public registration.
- Only admins can create or manage user accounts.
- Enforce project edit permissions for workflow, source selection, team, and output modification.

---

## Development Commands

The final project should support commands similar to:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

Backend:

```bash
cd apps/api
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd apps/web
npm run dev
```

Validation commands should be run when available:

```bash
cd apps/api
python -m compileall app
pytest
```

```bash
cd apps/web
npm run lint
npm run typecheck
npm run build
```

If a command is not configured, Codex should clearly say so instead of inventing unavailable scripts.

---

## Definition of Done for First Milestone

The first milestone is complete when:

1. The backend and frontend both run locally.
2. PostgreSQL and Redis run through Docker Compose.
3. Admin-created user accounts can log in.
4. Public registration is not exposed.
5. Users can view all KnowledgeBases.
6. Authorized users can create KnowledgeBases.
7. Authorized users can create Workspaces inside KnowledgeBases.
8. Users can add or upload SourceMaterials.
9. Users can configure AIAnalysisAgentConfigs.
10. Users can start Conversations on KnowledgeBases, Workspaces, or Projects.
11. Users can create and view ThoughtChains.
12. Users can create output-oriented Projects.
13. Users can select source materials and ThoughtChains for Projects.
14. Project team members can edit ProjectWorkflow and ProjectWorkflowSteps.
15. Project outputs can be viewed and edited according to project permissions.
16. Task status can be viewed.
17. README contains setup instructions.
18. `.env.example` documents all required variables.
19. The UI matches the uploaded design direction.
20. The codebase is clean, modular, and ready for later integration with LLM Wiki Builder, Graph RAG Builder, and Multi-Agent Workflow Engine.
