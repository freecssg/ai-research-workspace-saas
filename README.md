# AI Research Workspace SaaS

This repository contains Module 1 of the AI Research Assistant system: the Research Workspace SaaS API and UI foundation.

## Backend API

The backend lives in `apps/api` and uses FastAPI, SQLAlchemy 2.x, Pydantic v2, Alembic, and PostgreSQL.

### Database Setup

From the repository root, create a local environment file and start PostgreSQL and Redis:

```bash
cp .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d postgres redis
```

The default local database URL is:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/research_workspace
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

### API auth flow

Register a user:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"researcher@example.com","full_name":"Researcher","password":"change-me-123"}'
```

Login and copy the returned `access_token`:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"researcher@example.com","password":"change-me-123"}'
```

Use the bearer token for protected routes:

```bash
TOKEN="<paste access_token>"
curl http://127.0.0.1:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Create a workspace and project:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Default Workspace","description":"Local research workspace"}'

curl -X POST http://127.0.0.1:8000/api/v1/workspaces/<workspace_id>/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Literature Review","description":"MVP project"}'
```

Upload a supported research file:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/projects/<project_id>/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "upload=@/path/to/paper.pdf"
```

### API smoke test plan

After the database is running and migrations are applied, verify:

```bash
python -m compileall app scripts
alembic current
python -m scripts.check_db
curl http://127.0.0.1:8000/health
```

Then exercise this protected flow in `/docs` or with `curl`: register, login, create workspace, create project, upload file, create knowledge base, create task, create output, and confirm a second user cannot access the first user's workspace.
