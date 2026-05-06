# AI Research Workspace SaaS

This repository contains Module 1 of the AI Research Assistant system: the Research Workspace SaaS API and UI foundation.

## Backend API

The backend lives in `apps/api` and uses FastAPI, SQLAlchemy 2.x, Pydantic v2, Alembic, and PostgreSQL.

## Corrected Concept Model

This MVP is now modeled for a local research lab deployment rather than a public SaaS signup flow.

- A professor/admin creates lab user accounts for members.
- `KnowledgeBase` is the top-level research domain container.
- `Workspace` is a topic space inside a knowledge base.
- `SourceMaterial`, `AIAnalysisAgentConfig`, `ThoughtChain`, and `Conversation` attach to a knowledge base and optionally a workspace.
- `Project` is output-oriented and independent from the knowledge-base hierarchy.
- `ProjectSourceSelection` links a project to selected knowledge bases, workspaces, source materials, and thought chains.
- `ProjectWorkflow` and `ProjectWorkflowStep` model output generation workflow records.
- `Task` and `AgentOutput` can point at knowledge-base, workspace, or project scopes, but do not implement real LLM Wiki, RAG, or agent execution logic yet.

The previous public registration and project-owned knowledge-base assumptions are intentionally removed from the active API surface. There is no `/auth/register` endpoint; lab accounts are created by admins through `/api/v1/admin/users`.

### API Surface

The backend exposes `/health` plus corrected `/api/v1` routes for:

- authentication: login, current user, password change
- admin user management
- knowledge bases and nested workspaces
- source materials with local file upload support
- AI analysis agent configs
- thought chains and conversations
- output-oriented projects, project teams, source selections, workflows, workflow steps, outputs, and task records

All protected routes require a bearer token. Admin-only routes manage users, knowledge bases, workspaces, and agent configs. Project workflow, source-selection, and output edits require admin access or project `leader`/`editor` membership.

### Database Setup

From the repository root, create a local environment file and start PostgreSQL and Redis:

```bash
cp .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d postgres redis
```

The default local database URL is:

```text
postgresql+psycopg://postgres:guelph@localhost:5432/research_workspace
```

### Backend setup

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Migrations

From `apps/api`, run:

```bash
alembic upgrade head
```

Check the current Alembic revision:

```bash
alembic current
```

To create future migrations after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

### Create default admin user

For local development and frontend testing, create the default lab admin after migrations:

```bash
cd apps/api
alembic upgrade head
python scripts/create_default_admin.py
```

The default local values from `.env.example` are:

```text
DEFAULT_ADMIN_EMAIL=neo@ubc.ca
DEFAULT_ADMIN_NAME=Neo
DEFAULT_ADMIN_PASSWORD=guelph
```

These credentials are for local development only. Change them before using the system in any real lab deployment.

The script is idempotent. If the user already exists, it ensures the account is an active admin and leaves the password unchanged by default. To reset the password from `DEFAULT_ADMIN_PASSWORD`, run:

```bash
python scripts/create_default_admin.py --reset-password
```

You can also set `DEFAULT_ADMIN_RESET_PASSWORD=true` in `.env`.

### Database connectivity check

From `apps/api`, after installing dependencies and starting PostgreSQL:

```bash
python -m scripts.check_db
```

### Run the API

```bash
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Swagger API docs are available at:

```text
http://127.0.0.1:8000/docs
```

### Auth flow

Admins create users; users do not self-register:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change-me"}'
```

Use the returned token:

```bash
curl http://127.0.0.1:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### API smoke test plan

After the database is running and migrations are applied, verify:

```bash
python -m compileall app scripts
alembic current
python -m scripts.check_db
curl http://127.0.0.1:8000/health
```
