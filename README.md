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
