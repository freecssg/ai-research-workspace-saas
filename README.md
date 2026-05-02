# AI Research Workspace SaaS

This repository contains Module 1 of the AI Research Assistant system: the Research Workspace SaaS API and UI foundation.

## Backend API

The backend lives in `apps/api` and uses FastAPI, SQLAlchemy 2.x, Pydantic v2, Alembic, and PostgreSQL.

### Local setup

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a local `.env` file from the repository-level `.env.example`, then set `DATABASE_URL` for your PostgreSQL instance.

### Migrations

From `apps/api`, run:

```bash
alembic upgrade head
```

To create future migrations after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

### Run the API

```bash
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```
