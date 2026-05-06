# Frontend Design Implementation Plan

## Update Note

This revised plan incorporates the additional high-fidelity designs for the full KnowledgeBase list, Workspace list, Project list, and Admin User Management pages. These pages should now be treated as designed MVP pages rather than missing or optional screens.

## Scope

This plan covers frontend implementation only. The uploaded screenshots are the visual source of truth. Do not redesign the product, do not implement backend changes, and do not add real LLM Wiki, Graph RAG, or agent workflow logic in the frontend. The frontend should consume the corrected Module 1 backend contracts and represent generated AI content as reviewable, discussable, and selectable rather than directly editable.

## 1. Page Inventory and Route Mapping

| Screenshot | Design Role | Recommended Route | Notes |
| --- | --- | --- | --- |
| `00_logo.png` | Brand assets | Shared asset, no route | Use for app logo, login mark, favicon/app icon variants. |
| `01-login.png` | Login page | `/login` | Admin-created accounts only. No public registration link or sign-up flow. |
| `02-dashboard.png` | Research dashboard | `/dashboard` | Overview cards for Knowledge Bases, Workspaces, and Projects. |
| `03-knowledge-base-new.png` | New Knowledge Base wizard step | `/knowledge-bases/new` | Admin-only create page. Preserve form layout, but map "Research Subject Area" to `research_domain`. The "Architecture Type" visual choice should be treated as an initial analysis mode/template until the backend has a dedicated field. |
| `04-knowledge-base-detail.png` | Knowledge Base Wiki view | `/knowledge-bases/[kbId]` or `/knowledge-bases/[kbId]/wiki` | Read-only AI-generated wiki content with comments/discussion entry points. |
| `05-thought-chains.png` | Knowledge Base graph and Thought Chain discussion | `/knowledge-bases/[kbId]/graph` or `/knowledge-bases/[kbId]/thought-chains` | Graph nodes are read-only generated content. User interaction happens through discussion and ThoughtChain creation. |
| `06-workspace-new.png` | Workspace configuration flow | `/knowledge-bases/[kbId]/workspaces/new` | Admin-only workspace creation in the corrected backend. Visual copy says auto-generated workspaces; keep the auto-generated badge style for suggested workspaces. |
| `07-workspace-detail.png` | Workspace generated synthesis view | `/workspaces/[workspaceId]` | AI-generated workspace wiki/synthesis is read-only. Users can run configured agents and discuss content. |
| `08-workspace-materials.png` | Workspace source material import | `/workspaces/[workspaceId]/materials` | SourceMaterial upload/link/import page. Upload creates material records and task placeholders only. |
| `09-agent-management.png` | Agent configuration form | `/workspaces/[workspaceId]/agents/new` and `/knowledge-bases/[kbId]/agents/new` | Follow backend permissions: admin creates/updates configs in the current API. If members should manage configs, backend permission policy must change first. |
| `10-project-new.png` | New output Project page | `/projects/new` | Project is independent from Workspace. Resource Mapping selects KnowledgeBases, Workspaces, SourceMaterials, and ThoughtChains through `ProjectSourceSelection`. Change outdated copy that says a workspace is created. |
| `11-project-workflow.png` | Project workflow builder | `/projects/[projectId]/workflow` | Editable only for project `leader` or `editor`; non-team users can view project/output data but cannot edit workflow. |
| `12_profile.png` | User profile and integrations | `/profile` | User can view/update profile-like settings and change password. Integration fields may be local-only until API exists. |
| `13_system-settings.png` | System preferences | `/settings` | Admin-facing settings for model providers, files, RAG, citation/export preferences. Some settings are future placeholders unless backed by API. |

Additional pages now covered by the extra high-fidelity designs:

- `/knowledge-bases`: full KnowledgeBase list page. This is now a designed primary index page.
- `/workspaces`: full cross-KnowledgeBase Workspace list page. This is now a designed primary index page.
- `/projects`: full Project list page. This is now a designed primary index page.
- `/admin/users`: admin user management page. This is now designed and should be implemented as an admin-only page.

Additional page still optional for MVP:

- `/tasks`: optional global task status list. Task status can initially appear through status badges, drawers, or project/workspace panels rather than a standalone page.

### Extra Design Pages: Implementation Interpretation

The four added designs should remove ambiguity from the first frontend milestone. Treat these pages as part of the MVP route set, not optional placeholders.

#### `/knowledge-bases`

Purpose: top-level index for research domains and AI-maintained knowledge foundations.

Required UI behavior:

- Show all KnowledgeBases available to the lab.
- Use the designed card/list pattern consistently with the dashboard.
- Show status, research domain, workspace count, source material count, recent update, and primary actions.
- Admin users can access Create Knowledge Base.
- Non-admin users can view and open KnowledgeBases but should not see misleading create/edit affordances.
- Empty state should explain that the professor/admin creates KnowledgeBases for the lab.

#### `/workspaces`

Purpose: cross-KnowledgeBase topic-space index.

Required UI behavior:

- Show all Workspaces across KnowledgeBases.
- Display parent KnowledgeBase clearly on each row/card.
- Show research topic, status, material count, agent count, and latest analysis task state.
- Workspace creation should route through a selected KnowledgeBase. If no KnowledgeBase is selected, guide the user to choose one first.
- Users can open a Workspace and discuss generated content, but not directly edit generated wiki/RAG/graph nodes.

#### `/projects`

Purpose: output-oriented project index.

Required UI behavior:

- Show all Projects visible to authenticated users.
- Distinguish project type, output objective, status, team membership, and latest workflow progress.
- All users can read projects.
- Project leaders/editors get edit/run workflow actions.
- Non-team users get view-only actions.
- Create Project should remain available to authenticated users unless the backend policy changes.

#### `/admin/users`

Purpose: local lab account management.

Required UI behavior:

- Admin-only page.
- Replace public registration entirely.
- Support user list, create user, update user, activate/deactivate user, reset default password if backend supports it.
- Show role, active status, created date, and last update if available.
- Use table/list patterns from the new design; do not invent a separate enterprise admin style.


## 2. Corrected Product Model

The frontend must use this hierarchy:

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

Frontend implications:

- KnowledgeBase is the top-level research domain container.
- Workspace is a topic space inside a KnowledgeBase.
- Project is output-oriented and independent from KnowledgeBase/Workspace ownership.
- Project source selection references KnowledgeBases, Workspaces, SourceMaterials, ThoughtChains, and later previous outputs.
- AI-generated wiki content, graph nodes, RAG structures, and generated workspace synthesis must not be directly editable.
- Users guide the system through source selection, agent configuration, conversations, and ThoughtChains.
- Project workflow and project outputs are editable only by permitted project team roles.

## 3. Shared Layout System

### App Top Bar

Use a persistent top bar across authenticated pages:

- Left: ScholarFlow AI logo mark plus product name/subtitle.
- Center: rounded search input, usually 420-560px wide, with placeholder adapted to context.
- Right: notification icon, settings icon, circular avatar.
- Height: about 80-96px based on screenshots.
- Bottom border: subtle cool blue-gray.
- Background: white with very light blue tint.

### Login Layout

Use a two-column full-screen layout:

- Left side: brand, headline, product explanation, staged knowledge-to-insight illustration, three value tiles, copyright.
- Right side: centered login card with logo, title, fields, remember checkbox, sign-in button, privacy note.
- Background: near-white blue with subtle wave-line texture.

### Main Content Layouts

Use three recurring layouts:

- Dashboard/form shell: top bar plus centered max-width content, no left sidebar.
- KnowledgeBase shell: top bar plus left tree sidebar, middle table-of-contents or graph canvas, main content/right conversation panel.
- Project workflow shell: top bar plus left project list, center workflow canvas, right workflow template panel.

### Sidebars

Use sidebars as part of tool surfaces, not marketing navigation:

- Width around 280-340px.
- White card-like panel with subtle border and 12-16px radius.
- Tree indentation, vertical connector lines, active row blue-tinted background.
- Primary nav items: Knowledge Base, Workspaces, Research Papers/Source Materials, AI Orchestrator, Archive.

### Page Headers

Use large, clear page titles with one line of supporting copy:

- Dashboard/new pages: title 40-52px.
- Tool/detail pages: title 32-44px.
- Section cards: title 18-24px.
- Keep labels compact and avoid oversized text inside cards.

## 4. Design Tokens

These are implementation estimates from the screenshots. Fine-tune during visual QA.

### Color

| Token | Approx Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#F7FAFF` | App background. |
| `--color-surface` | `#FFFFFF` | Cards, panels, top bar. |
| `--color-surface-soft` | `#F2F7FF` | Active nav rows, icon tile backgrounds. |
| `--color-border` | `#D8E4F4` | Cards, panels, inputs. |
| `--color-border-strong` | `#B8CCEA` | Focused controls, selected cards. |
| `--color-text` | `#071A44` | Main headings and important body text. |
| `--color-muted` | `#5E6D8E` | Supporting copy and metadata. |
| `--color-primary` | `#005FD6` | Primary buttons, active tabs, selected states. |
| `--color-primary-dark` | `#004C9F` | Button gradients or hover state. |
| `--color-info` | `#1C7FE8` | Links, graph accents, active markers. |
| `--color-teal` | `#0A9A9A` | Agent/status accents. |
| `--color-success` | `#16A676` | Ready/active badges and connection status. |
| `--color-warning` | `#D9891A` | Frontier/auto-generated amber badges. |
| `--color-danger` | `#D93030` | PDF/source icon accents and destructive state. |

### Typography

- Use a clean sans-serif stack: `Inter`, `SF Pro Display`, `system-ui`, sans-serif.
- Body text appears 16-18px with relaxed line height around 1.5.
- Large page headings: 40-52px, weight 700 or 800.
- Card headings: 20-28px, weight 650-750.
- Form labels: 14-16px, weight 500-600.
- Metadata and hints: 13-15px, muted color.
- Generated wiki body content can use a more editorial serif-like treatment only if matching the screenshot; otherwise keep the same sans stack with larger line height.

### Spacing

- Use an 8px spacing scale.
- Page horizontal padding: 48-80px on desktop.
- Main vertical section gaps: 24-40px.
- Card padding: 24-36px.
- Form field gaps: 16-24px.
- Sidebar item height: 44-56px.

### Radius

- Inputs/buttons: 8-10px.
- Cards/panels: 12-16px, matching screenshot card softness.
- Icon tiles: 12-16px.
- Avatars and pills: full radius.

### Shadows

- Cards use very subtle cool shadows, not heavy elevation.
- Suggested shadow: `0 12px 32px rgba(12, 38, 80, 0.06)`.
- Login card can use stronger shadow: `0 20px 60px rgba(12, 38, 80, 0.12)`.

### Buttons

- Primary: solid blue, subtle vertical gradient acceptable when matching screenshot.
- Secondary: white background, blue border, blue text.
- Icon buttons: square or circular with icon-only treatment and hover state.
- Destructive actions should not reuse primary blue.
- Button heights: 44-56px.

### Badges and Chips

- Pill radius, compact padding.
- Selected/research chips: light blue.
- Development/ready/active chips: light green.
- Auto-generated chips: blue, teal, or amber depending on category.
- Use badges for statuses, not large explanatory blocks.

## 5. Component Inventory

Core app components:

- `BrandLogo`
- `AppTopBar`
- `GlobalSearch`
- `IconButton`
- `UserAvatarButton`
- `PageShell`
- `PageHeader`
- `Breadcrumbs`
- `ActionFooter`

Navigation and layout:

- `EntityTreeSidebar`
- `SidebarSection`
- `SidebarTreeItem`
- `TopLevelNavItem`
- `ThreePaneLayout`
- `DashboardGrid`
- `SettingsGrid`

Cards and lists:

- `DashboardSummaryCard`
- `EntityListRow`
- `KnowledgeBaseListCard`
- `WorkspaceListCard`
- `WorkspaceSuggestionCard`
- `AgentCard`
- `IntegrationCard`
- `SettingsSectionCard`
- `ProjectListItem`
- `ProjectStatusCard`
- `AdminUserTable`
- `UserStatusBadge`
- `WorkflowTemplateCard`
- `ContextNoteCard`

Forms:

- `FormCard`
- `TextField`
- `TextareaField`
- `SelectField`
- `DateField`
- `SegmentedControl`
- `ChoiceCard`
- `TagInput`
- `CheckboxTree`
- `ToggleSwitch`
- `RadioCardGroup`
- `PasswordField`

Knowledge and AI surfaces:

- `WikiViewTabs`
- `TableOfContents`
- `GeneratedContentArticle`
- `CommentButton`
- `GraphCanvas`
- `GraphNodeCard`
- `GraphZoomControls`
- `ThoughtChainPanel`
- `ConversationThread`
- `ConversationComposer`
- `ContextualNotesPanel`

Source material and workflow:

- `UploadDropzone`
- `AccordionPanel`
- `AgentSelector`
- `WorkflowCanvas`
- `WorkflowNode`
- `WorkflowConnector`
- `WorkflowToolPalette`
- `WorkflowTabs`

Permission-aware wrappers:

- `AdminOnly`
- `ProjectEditorOnly`
- `ReadOnlyGeneratedContent`
- `DisabledWithTooltip`

## 6. Navigation Structure

Top-level authenticated navigation should be lightweight:

- Dashboard: `/dashboard`
- Knowledge Bases: `/knowledge-bases`
- Workspaces: `/workspaces` or contextual under KnowledgeBase
- Projects: `/projects`
- Profile: `/profile`
- Settings: `/settings`
- Admin Users: `/admin/users` for admins only

Contextual navigation:

- KnowledgeBase detail:
  - Wiki view
  - Graph view
  - Thought Chains
  - Workspaces
  - Source Materials
  - Agent configs
  - Archive
- Workspace detail:
  - Generated wiki/synthesis
  - Materials
  - AI Orchestrator/agents
  - Thought Chains
  - Archive
- Project detail:
  - Workflow
  - Sources
  - Team
  - Outputs
  - Tasks/status

Search:

- Global search placeholder on dashboard: "Search papers, workspaces, or projects".
- KnowledgeBase context: "Search Knowledge Base...".
- Workspace context: "Search workspace...".
- Search results should eventually span KnowledgeBases, Workspaces, SourceMaterials, ThoughtChains, and Projects.

## 7. Per-Page Implementation Notes

### `/knowledge-bases`

- Implement as a primary list page, not a dashboard duplicate.
- Use the added high-fidelity design as the source of truth for layout, filters, cards/table rows, and action placement.
- Show every readable KnowledgeBase.
- Display: name, research_domain, description summary, status, workspace count, source material count, task/analysis state, updated date.
- Primary admin action: Create Knowledge Base.
- Non-admin users should see View/Open actions only.
- Include search and lightweight filters if shown in the design.
- Empty state should be lab-contextual: KnowledgeBases are normally created by the professor/admin.

### `/workspaces`

- Implement as a full cross-KnowledgeBase list page using the added design.
- Each item must show its parent KnowledgeBase to avoid confusing Workspaces with top-level containers.
- Display: name, research_topic, parent KnowledgeBase, status, material count, agent count, thought-chain count, latest analysis status, updated date.
- Create Workspace action should either require selecting a KnowledgeBase first or route to `/knowledge-bases` when no parent is known.
- Do not present Workspace as manually editable content. It is a topic-specific AI-maintained knowledge subset.

### `/projects`

- Implement as a full Project list page using the added design.
- Projects are output objectives, not containers for KnowledgeBases.
- Display: name, project_type, output_objective, status, team role, workflow progress, selected source count, updated date.
- All authenticated users can read/open projects.
- Show edit/run actions only when the current user is leader/editor or admin.
- Use clear badges for project type and status.

### `/admin/users`

- Implement from the added admin user management design.
- Admin-only; hide navigation entry for non-admin users and protect the route in the client.
- User table/list should show: name, email, role, active status, created date, updated date, and row actions.
- Supported actions: create user, edit user, activate/deactivate user, reset password if backend supports it.
- There is no `/register` route and no public sign-up CTA anywhere in the frontend.

### `/login`

- Match split layout and card proportions.
- Include email, password, remember me, forgot password text, password visibility icon, sign-in button.
- Do not add sign-up or registration.
- On success, redirect to `/dashboard`.

### `/dashboard`

- Show three dashboard cards: Knowledge Base, Workspaces, Projects.
- Each card has icon tile, title, maturity/capacity rows, progress bar, three recent items, Create and View all actions.
- Route Create buttons:
  - Knowledge Base: `/knowledge-bases/new` for admin users; hide or disable for non-admin users.
  - Workspaces: route through selected KB or `/knowledge-bases`.
  - Projects: `/projects/new`.

### `/knowledge-bases/new`

- Preserve centered form card and icon/title treatment.
- Fields map to backend:
  - title -> `name`
  - research subject area -> `research_domain`
  - description/scope -> `description`
  - status defaults to `draft`
- Labels and architecture cards may be local UI state until backend fields exist.
- Admin-only page.

### `/knowledge-bases/[kbId]`

- Use left KnowledgeBase tree sidebar.
- Use tabs for Wiki View and Graph View.
- Wiki article is read-only generated content.
- Comment buttons open conversation or comment thread UI, not inline node editing.
- Table of contents should scroll or select generated sections.

### `/knowledge-bases/[kbId]/graph`

- Use graph canvas with dotted grid, node card, connection paths, zoom controls.
- Right panel contains ThoughtChain conversation and contextual notes.
- Graph nodes are read-only; open detail or source reference panels rather than editable forms.
- Conversation messages create `ConversationMessage` records.
- Useful reasoning paths can create `ThoughtChain` records.

### `/knowledge-bases/[kbId]/workspaces/new`

- Show suggested auto-generated workspace cards with icon, title, auto-generated badge, description, Configure Source button.
- Add Workspace dashed card creates a custom workspace.
- Admin-only creation in current backend.
- Back/Next footer follows screenshot.

### `/workspaces/[workspaceId]`

- Use left workspace-specific sidebar and right AI Agent Orchestrator panel.
- Main article is generated synthesis and read-only.
- Agent cards have Run buttons; Run should create a `Task` record only.
- Agent execution results are not implemented in frontend.

### `/workspaces/[workspaceId]/materials`

- Use Data Sources page with accordion sections: Import, Search, Subscribe.
- Import contains upload dropzone, agent selector, active badge, Add AI Agent action.
- Upload creates `SourceMaterial`.
- Assigning an agent may create or select `AIAnalysisAgentConfig`.
- Save Changes should not imply parsing/indexing is complete; it only records source material and optional task.

### `/workspaces/[workspaceId]/agents/new`

- Two-column form layout with large left form stack and right side settings cards.
- Sections: Agent Identity, Model Configuration, Output Specification, Usage Scope, Data Knowledge.
- Save actions create/update `AIAnalysisAgentConfig`.
- Current backend makes this admin-only; show permission-disabled state for non-admin users unless policy changes.

### `/projects/new`

- Use project information and extra information cards on the left.
- Use Team Members, Resource Mapping, and review CTA on the right.
- Correct product semantics:
  - Creating a project does not create a workspace.
  - Resource Mapping creates `ProjectSourceSelection` rows.
  - Creator becomes project leader.
- Some screenshot fields lack backend equivalents (`start_date`, `funding_source`, `funding_amount`); keep out of the MVP form or store only after backend support is added.

### `/projects/[projectId]/workflow`

- Three-pane workflow builder: project list, canvas, existing workflow templates.
- Tabs: Literature Review, REB, Data Process, Result Presentation.
- Workflow nodes map to `ProjectWorkflowStep`.
- Existing workflow templates are UI presets until backend templates exist.
- Editing requires project `leader` or `editor`.
- Non-team users can view outputs/project metadata but should see disabled workflow editing controls.

### `/profile`

- Account information card with avatar, name, email, reset/change password.
- Team Management card for active research group. Backend does not yet model research groups, so mark as future/local setting.
- Personal Integrations card for OpenClaw API, Obsidian, Zotero. These need future backend support; implement as disabled/local draft fields unless API exists.

### `/settings`

- Admin settings page with AI model configuration, Knowledge Base and RAG, file management, academic preferences.
- Most settings require future backend contracts.
- Preserve layout and control styles, but avoid fake persistence unless explicitly backed by API/local settings.

### `/admin/users`

- Required but not designed.
- Reuse the same top bar, page header, form cards, table/list rows, status badges, and modal patterns from the screenshots.
- Admin can list, create, update, deactivate users.
- No public registration page.

## 8. Data Requirements by Page

| Page | Required Data | Backend/API Source |
| --- | --- | --- |
| Login | email, password | `POST /api/v1/auth/login` |
| Dashboard | current user, recent KBs, workspaces, projects, counts/progress | `/auth/me`, `/knowledge-bases`, `/projects`; aggregate endpoints can be added later |
| KnowledgeBase list | all KnowledgeBases, status, counts if available | `GET /api/v1/knowledge-bases`; counts can be derived client-side or added later |
| Workspace list | all Workspaces, parent KnowledgeBase, status, counts if available | Current backend may need `GET /api/v1/workspaces`; otherwise compose from `/knowledge-bases/{id}/workspaces` |
| Project list | all Projects, project type/status/team capability | `GET /api/v1/projects`, `/projects/{id}/team` when needed |
| Admin users | users, roles, active status | `GET /api/v1/admin/users`, admin-only |
| New KnowledgeBase | name, description, research_domain, status | `POST /api/v1/knowledge-bases` |
| KnowledgeBase detail | KB metadata, generated wiki sections, TOC, conversations/comments | `/knowledge-bases/[id]`, future generated content endpoint, `/knowledge-bases/[id]/conversations` |
| KnowledgeBase graph | graph nodes/edges, thought chains, contextual notes | future graph read endpoint, `/knowledge-bases/[id]/thought-chains`, `/conversations` |
| New Workspace | parent KB, workspace name/topic/status, suggested templates | `/knowledge-bases/[id]`, `POST /knowledge-bases/[id]/workspaces` |
| Workspace detail | workspace metadata, generated synthesis, agent configs, tasks | `/workspaces/[id]`, `/workspaces/[id]/agents`, `/tasks` |
| Workspace materials | source materials, upload metadata, agent configs | `/workspaces/[id]/materials`, `/workspaces/[id]/agents` |
| Agent config | agent config fields, source kind options, model options | `/agents`, enum values, future model/provider settings |
| New Project | project fields, team users, selectable KB/workspace/material/thought-chain tree | `/projects`, `/admin/users` for admin/team search or future user lookup, `/knowledge-bases`, `/materials`, `/thought-chains` |
| Project workflow | project, team role, workflows, steps, outputs, tasks | `/projects/[id]`, `/projects/[id]/workflows`, `/workflows/[id]/steps`, `/projects/[id]/outputs`, `/tasks` |
| Profile | current user, integrations, team selection | `/auth/me`, `/auth/change-password`, future integration settings |
| Settings | system settings, model providers, file preferences, citation/export prefs | future settings endpoints |
| Admin users | users, roles, active status | `/admin/users` |

## 9. Read-Only AI-Generated Content

These pages/surfaces should render AI-generated content as read-only:

- KnowledgeBase wiki view.
- KnowledgeBase graph nodes and edges.
- KnowledgeBase generated contextual notes.
- Workspace generated synthesis/wiki content.
- Workspace generated graph/RAG/wiki subsets.
- Agent-generated insight cards.
- Generated project output drafts unless the user has project editor permission and the output is explicitly opened in an editable project-output mode.

Allowed interactions on read-only generated content:

- comment
- discuss with AI
- cite/source inspect
- select as a project source
- create ThoughtChain
- run or queue analysis task

Disallowed interactions:

- direct node editing
- direct graph edge editing
- direct wiki node editing
- direct low-level RAG/index editing

## 10. User Editing Surfaces

Authenticated users may edit or create:

- login/session state
- password change
- conversations and messages
- ThoughtChains they create, subject to backend policy
- Projects
- SourceMaterials they upload, subject to backend policy

Admin-only editing:

- users
- KnowledgeBases
- Workspaces
- AIAnalysisAgentConfigs in the current backend policy
- system settings when settings APIs exist

Permission-dependent editing:

- ProjectWorkflow
- ProjectWorkflowStep
- ProjectSourceSelection
- AgentOutput
- project workflow tasks

## 11. Project Team Edit Permissions

Project pages must calculate user capability from project team membership:

- `leader`: edit project metadata, team, sources, workflows, steps, outputs, project tasks.
- `editor`: edit sources, workflows, steps, outputs, project tasks.
- `viewer`: read project workflow details and outputs only.
- non-team member: read project and outputs only; no workflow/source/output editing.
- admin: may edit, but UI should still make role context visible.

Affected pages:

- `/projects/[projectId]/workflow`
- `/projects/[projectId]/sources`
- `/projects/[projectId]/outputs`
- project team management section
- workflow task/run buttons

Disable rather than hide complex controls when useful for comprehension, but hide admin-only navigation from non-admin users.

## 12. Frontend State, Feedback, and Permission Patterns

### Loading states

- Use skeleton cards/rows for list pages.
- Use subtle inline spinners for button-level actions.
- Avoid full-screen loaders except during initial auth/session restoration.

### Empty states

- Empty KnowledgeBase list: explain that admins create lab-level knowledge foundations.
- Empty Workspace list: guide the user to open or create a KnowledgeBase first.
- Empty Project list: encourage creating an output objective.
- Empty materials: guide upload/import/link source actions.
- Empty workflow: show template selection and create workflow action for editors.

### Error states

- Use compact error banners inside the current page/card.
- Keep API error text user-readable; do not expose stack traces.
- For permission errors, explain the required capability, e.g. “Only project leaders and editors can modify this workflow.”

### Toasts and notifications

Use consistent toast messages for:

- create/update/delete success
- upload success/failure
- task queued
- workflow saved
- permission denied

Toasts should not replace persistent status indicators for long-running AI tasks.

### Modal and drawer patterns

- Use modals for small confirmation tasks: delete, deactivate user, reset password.
- Use drawers or full pages for complex forms: agent config, project source mapping, workflow step editing.
- Do not put large multi-section forms into small modals.

### Permission gating

- Hide admin-only navigation from non-admin users.
- For project workflow controls, prefer disabled-with-tooltip when the feature is visible but unavailable due to team role.
- Client-side permission checks are for UX only; backend remains the authority.

## 13. Responsive Design Rules

The high-fidelity designs appear desktop-first. Implement responsive behavior using these defaults until mobile/tablet designs are available:

- Desktop >= 1280px: match screenshots exactly as much as possible.
- Tablet 768-1279px: collapse three-pane layouts into two panes or stacked panels; keep top bar visible.
- Mobile < 768px: collapse sidebars into drawers; stack cards/forms vertically; keep primary actions sticky when useful.
- Tables should become card lists on narrow screens.
- Graph and workflow canvases may show a mobile warning/limited view if full editing is not practical.

## 14. API Integration and Mock Data Rules

- Use real backend APIs wherever they already exist.
- Mock only missing generated AI content endpoints, graph data, workflow templates, integration settings, and aggregate counters.
- Keep mock data in one clearly named location such as `src/lib/mock-data.ts` or `src/features/*/mock.ts`.
- Never mix mock objects directly into page components.
- Use a typed API client and shared frontend types matching backend schemas.
- Keep route params named consistently: `kbId`, `workspaceId`, `projectId`, `workflowId`, `stepId`.

## 15. Status, Label, and Copy Conventions

### KnowledgeBase status

- `draft`: Draft
- `building`: Building
- `ready`: Ready
- `failed`: Failed
- `archived`: Archived

### Workspace status

- `draft`: Draft
- `analyzing`: Analyzing
- `ready`: Ready
- `failed`: Failed
- `archived`: Archived

### SourceMaterial processing status

- `uploaded`: Uploaded
- `queued`: Queued
- `processing`: Processing
- `analyzed`: Analyzed
- `indexed`: Indexed
- `failed`: Failed

### Project status

- `draft`: Draft
- `active`: Active
- `completed`: Completed
- `archived`: Archived

### Project role labels

- `leader`: Leader
- `editor`: Editor
- `viewer`: Viewer

Copy rules:

- Use “Knowledge Base” for the lab-level research foundation.
- Use “Workspace” or “Topic Workspace” for a topic-specific subset.
- Use “Project” only for output-oriented workflows.
- Use “Source Material” instead of “File” in user-facing UI unless the user is specifically uploading a file.
- Use “AI-generated” and “read-only” language where users might otherwise expect manual editing.

## 16. Visual QA Checklist

For every page group, Codex should verify:

- Uses the provided logo asset.
- Uses the same top bar height, alignment, search placement, and avatar/settings placement.
- Uses the same primary/secondary button styles.
- Uses the same card radius, border, and shadow.
- Uses consistent blue/teal/green/amber/red status colors.
- Does not add public registration.
- Does not make generated wiki/graph/RAG nodes directly editable.
- Does not reintroduce Workspace as the top-level parent of Project.
- Handles loading, empty, error, and permission-denied states.

## 17. Recommended Implementation Order

1. Frontend foundation:
   - Next.js app shell, Tailwind tokens, shadcn/ui setup, lucide icons, logo assets, top bar, page shell.
2. Auth foundation:
   - `/login`, token storage, API client, protected route guard, `/auth/me`, no registration route.
3. Dashboard:
   - static-to-live dashboard cards using current API data.
4. KnowledgeBase creation and detail:
   - `/knowledge-bases/new`, `/knowledge-bases/[kbId]`, read-only wiki layout.
5. KnowledgeBase graph and ThoughtChains:
   - graph canvas placeholder, conversation panel, ThoughtChain list/create flow.
6. Workspace flow:
   - `/knowledge-bases/[kbId]/workspaces/new`, `/workspaces/[workspaceId]`.
7. Source materials:
   - upload/import page with `SourceMaterial` API integration.
8. Agent configuration:
   - agent config form and agent cards with permission gating.
9. Project creation:
   - project form, team member selector, resource mapping, source selection creation.
10. Project workflow:
   - workflow builder canvas, workflow/step CRUD, project team edit gates.
11. Outputs and tasks:
   - output list/detail/edit surfaces, task status badges/run actions.
12. Profile and settings:
   - profile/password first, settings placeholders only where backend is missing.
13. Admin users:
   - admin-only user list/create/edit/deactivate using shared components.
14. Visual QA:
   - compare each page against screenshots at desktop size, then add responsive adjustments.

## 18. Visual Consistency Rules for Future Frontend Tasks

- Treat the screenshots as visual source of truth.
- Do not introduce a new visual theme, landing page, or marketing layout.
- Use the same soft blue-white background, subtle wave/dot textures, and calm academic tone.
- Use card/panel radii and shadows consistently.
- Keep UI dense enough for a research tool, but preserve the spacious form layouts shown.
- Use lucide icons where they match; use the provided logo asset for brand.
- Do not invent direct edit controls for generated wiki, graph, or RAG nodes.
- Do not add public registration, billing, teams/org SaaS flows, or unrelated settings.
- Preserve blue primary actions and white outlined secondary actions.
- Keep top bar alignment consistent across pages.
- Keep search placement and avatar/settings/notification placement consistent.
- Use permission-aware disabled states for controls the user can see but cannot use.
- Reuse components before creating page-specific variants.
- Verify text does not overflow cards, chips, buttons, or sidebars.
- Every implemented page should pass screenshot-based visual review before moving to the next page group.

## End Summary

### Detected Pages

- Logo/brand asset
- Login
- Dashboard
- KnowledgeBase list
- New KnowledgeBase
- KnowledgeBase detail wiki view
- KnowledgeBase graph and ThoughtChain view
- Workspace list
- New Workspace configuration
- Workspace detail synthesis view
- Workspace source materials import
- AI agent configuration
- Project list
- New Project
- Project workflow builder
- Admin user management
- User profile
- System settings

### Reusable Components

Primary reusable components are `AppTopBar`, `BrandLogo`, `GlobalSearch`, `PageShell`, `PageHeader`, `EntityTreeSidebar`, `DashboardSummaryCard`, `FormCard`, `TextField`, `TextareaField`, `SelectField`, `ChoiceCard`, `TagInput`, `Badge`, `Tabs`, `UploadDropzone`, `AgentCard`, `GraphCanvas`, `ThoughtChainPanel`, `ConversationThread`, `ProjectListItem`, `WorkflowCanvas`, `WorkflowNode`, `IntegrationCard`, `SettingsSectionCard`, `AdminOnly`, and `ProjectEditorOnly`.

### Remaining Design / Implementation Decisions

The extra designs now cover the full KnowledgeBase list, Workspace list, Project list, and Admin user management pages. Remaining decisions are mostly interaction/state details rather than missing core pages:

- Mobile and tablet responsive layouts.
- Empty, loading, error, and permission-denied state screenshots.
- Modal/dialog visual details for delete, deactivate, reset password, source selection, and workflow-step editing.
- Toast/notification visual details.
- Generated output editor/detail page.
- Task status page, task drawer, or task activity panel.
- Exact graph interaction behavior: zoom, select, inspect source, create ThoughtChain, and comment.
- Actual settings persistence model and backend settings APIs.
- Role-specific disabled-state copy.
- Exact font file and finalized color token values.
- Whether `/workspaces` should be implemented as a global index immediately or only after `/knowledge-bases/[kbId]/workspaces` is stable.
- Whether admin can override project team permissions from the project UI or only through admin/system controls.

### Recommended First Frontend Implementation Task

Build the frontend foundation and auth shell first: install/configure the web app stack if needed, add Tailwind/shadcn tokens from this plan, add the shared `AppTopBar`, `PageShell`, logo assets, API client, protected route guard, and implement `/login` against `POST /api/v1/auth/login` with no registration path.
