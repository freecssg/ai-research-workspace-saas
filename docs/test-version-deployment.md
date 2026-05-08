# ScholarFlow AI Test Version Deployment Guide

This guide deploys the Module 1 Research Workspace SaaS test version on a local lab server. It covers the runtime environment, database initialization, build/start commands, log locations, and a smoke test plan for the main MVP functions.

The test version is for internal lab evaluation only. It includes the Research Workspace SaaS control layer, but it does not run real LLM Wiki generation, Graph RAG indexing, external AI workflows, citation checking, or LangGraph execution.

## 1. Runtime Environment

Recommended host:

- macOS or Linux server with Docker Desktop / Docker Engine
- Python 3.11 or newer
- Node.js 20 LTS or newer
- npm 10 or newer
- PostgreSQL and Redis through Docker Compose

Network ports used by default:

| Service | Port | Purpose |
| --- | ---: | --- |
| Web app | `3000` | Next.js frontend |
| API | `8000` | FastAPI backend |
| PostgreSQL | `5432` | Application database |
| Redis | `6379` | Future task queue/cache service |

Main runtime paths:

| Path | Purpose |
| --- | --- |
| `.env` | Local runtime configuration copied from `.env.example` |
| `apps/api/uploads` | Default local uploaded source material storage when API runs from `apps/api` |
| `logs/api.log` | Suggested FastAPI test deployment log |
| `logs/web.log` | Suggested Next.js test deployment log |
| Docker volume `research_workspace_postgres_data` | PostgreSQL data |
| Docker volume `research_workspace_redis_data` | Redis data |

## 2. Configuration

Create the local environment file from the repository root:

```bash
cp .env.example .env
```

Minimum required settings for the test version:

```text
DATABASE_URL=postgresql+psycopg://postgres:guelph@localhost:5432/research_workspace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=guelph
POSTGRES_DB=research_workspace
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me-in-local-development
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=./uploads
DEFAULT_ADMIN_EMAIL=neo@ubc.ca
DEFAULT_ADMIN_NAME=Neo
DEFAULT_ADMIN_PASSWORD=guelph
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

For any real lab deployment, replace `SECRET_KEY` and the default admin password before allowing users onto the system.

## 3. Database Installation and Initialization

Start PostgreSQL and Redis:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d postgres redis
```

Check service health:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml ps
docker compose --env-file .env -f infra/docker/docker-compose.yml logs postgres
docker compose --env-file .env -f infra/docker/docker-compose.yml logs redis
```

If PostgreSQL is already running from an older local volume and Alembic reports that
database `research_workspace` does not exist, create it inside the container:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml exec postgres \
  createdb -U postgres research_workspace
```

Install backend dependencies:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Apply database migrations:

```bash
alembic upgrade head
alembic current
```

Create the default local admin user:

```bash
python scripts/create_default_admin.py
```

Default local test login:

```text
Email: neo@ubc.ca
Password: guelph
```

The seed script is idempotent. By default, it does not overwrite an existing password. To reset the admin password from `.env`, run:

```bash
python scripts/create_default_admin.py --reset-password
```

Verify the database connection:

```bash
python -m scripts.check_db
```

## 4. Build and Deploy the Backend

From `apps/api`, validate imports:

```bash
python -m compileall app scripts
python -c "from app.main import app; print(app.title)"
```

Run the API in foreground for debugging:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run the API as a simple background test process with logs:

```bash
cd ../..
mkdir -p logs
cd apps/api
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../../logs/api.log 2>&1 &
```

API health check:

```bash
curl http://127.0.0.1:8000/health
```

Swagger API docs:

```text
http://127.0.0.1:8000/docs
```

## 5. Build and Deploy the Frontend

Install frontend dependencies:

```bash
cd apps/web
npm install
```

Validate and build:

```bash
npm run lint
npm run typecheck
npm run build
```

Run in foreground for debugging:

```bash
npm run dev
```

Run the compiled test frontend in foreground:

```bash
npm run start -- -H 0.0.0.0 -p 3000
```

Run the compiled frontend as a simple background test process with logs:

```bash
cd ../..
mkdir -p logs
cd apps/web
nohup npm run start -- -H 0.0.0.0 -p 3000 > ../../logs/web.log 2>&1 &
```

Open the app:

```text
http://127.0.0.1:3000/login
```

## 6. Log Locations

Recommended test deployment logs:

| Component | Command |
| --- | --- |
| API log | `tail -f logs/api.log` |
| Web log | `tail -f logs/web.log` |
| PostgreSQL log | `docker compose --env-file .env -f infra/docker/docker-compose.yml logs -f postgres` |
| Redis log | `docker compose --env-file .env -f infra/docker/docker-compose.yml logs -f redis` |

FastAPI and Next.js write request/build errors to stdout/stderr. The `nohup` commands above redirect those streams to `logs/api.log` and `logs/web.log`.

Uploaded files are stored under `UPLOAD_DIR`. With the default test command that runs the API from `apps/api`, `UPLOAD_DIR=./uploads` resolves to:

```text
apps/api/uploads
```

## 7. Main Function Test Plan

Run these tests after the database, backend, and frontend are up.

### 7.1 Health and Authentication

1. Open `http://127.0.0.1:8000/health`.
2. Open `http://127.0.0.1:3000/login`.
3. Log in with `neo@ubc.ca` / `guelph`.
4. Confirm the app redirects to `/dashboard`.
5. Confirm no `/register` route or public registration link appears.

API check:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"neo@ubc.ca","password":"guelph"}'
```

### 7.2 Dashboard

1. Confirm `/dashboard` renders the top bar and three summary cards.
2. Confirm Knowledge Bases, Workspaces, and Projects cards use correct navigation.
3. Confirm non-generated AI/RAG execution is not triggered from dashboard actions.

### 7.3 Settings and Admin User Management

1. Open `/settings` as admin.
2. Confirm Preferences sections render:
   - AI Model Configuration
   - Knowledge Base & RAG
   - Files & Management
   - Academic Preferences
   - User Management
3. Click Add in User Management.
4. Add a lab user email.
5. Confirm the backend creates an active `member` account with the local default password.
6. Confirm Settings model/provider/RAG fields remain local UI settings and do not call external APIs.

### 7.4 Profile and Project Team Management

1. Open `/profile`.
2. Confirm Account Information displays the current user.
3. Use Reset Password with a new password of at least 8 characters.
4. Confirm Personal Integrations fields are masked and local-only.
5. Create a project if none exists.
6. In Team Management, select a project owned/led by the current user.
7. Add a lab user to the project with `viewer`, `editor`, or `leader`.
8. Update the role and remove the user.

### 7.5 Knowledge Base Flow

1. Open `/knowledge-bases`.
2. Create a Knowledge Base as admin.
3. Open the Knowledge Base detail page.
4. Confirm generated wiki content is presented as read-only.
5. Open Materials and upload a supported research file.
6. Open Agents and create/configure an AI analysis agent config.
7. Open Thought Chains and create a reasoning path.
8. Open Conversations and create a conversation/message.

### 7.6 Workspace Flow

1. From a Knowledge Base, open `/knowledge-bases/{kbId}/workspaces/new`.
2. Create a Workspace under the Knowledge Base.
3. Open `/workspaces/{workspaceId}`.
4. Confirm generated workspace synthesis is read-only.
5. Upload workspace SourceMaterials.
6. Create/view workspace Agent configs.
7. Create/view workspace Thought Chains and Conversations.

### 7.7 Project Flow

1. Open `/projects`.
2. Create a new Project from `/projects/new`.
3. Confirm the creator is added as project leader.
4. Open Project Sources and add KnowledgeBase, Workspace, SourceMaterial, or ThoughtChain selections.
5. Open Project Workflow and create workflow/step records.
6. Confirm workflow run controls do not execute real AI workflows.
7. Open Project Outputs and create/edit/delete output records as leader/editor.
8. Open Project Team and verify leader/editor/viewer permissions.
9. Open Project Conversations and create a user message.
10. Open Project Tasks and confirm task records display when present.

### 7.8 Permission Checks

1. Log in as a `member` user.
2. Confirm member can read Knowledge Bases, Workspaces, Projects, and outputs.
3. Confirm member cannot create Knowledge Bases, Workspaces, or Agent configs unless admin.
4. Confirm non-team users can view project data but cannot edit project sources, workflow, team, or outputs.
5. Confirm project `viewer` cannot edit workflow/output records.
6. Confirm project `editor` can edit workflow/output records but cannot manage team unless backend policy allows it.

## 8. Known Test-Version Limitations

- Settings and integration fields are local UI state only until backend settings APIs exist.
- No real LLM Wiki, Graph RAG, vector indexing, AI agent execution, citation checking, or output generation is implemented in Module 1.
- Conversations store messages, but no AI response generator is connected.
- Some dashboard/list counters are derived or placeholder values until aggregate endpoints are added.
- Project workflow templates are frontend presets; they do not execute LangGraph workflows.
- Docker Compose currently starts only PostgreSQL and Redis. API and web are run directly from the host for the test version.

## 9. Stop / Restart

Stop Docker services:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml down
```

Stop foreground API/web processes with `Ctrl+C`.

For background `nohup` test processes, find and stop them:

```bash
lsof -i :8000
lsof -i :3000
kill <PID>
```

Restart sequence:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d postgres redis
cd apps/api && source .venv/bin/activate && alembic upgrade head
cd ../web && npm run build
```
