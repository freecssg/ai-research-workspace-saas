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

## Primary Goal

Build a production-quality MVP foundation for the Research Workspace SaaS.

The first milestone is a working local application where a user can:

1. Create a workspace.
2. Create a project inside a workspace.
3. Upload and manage files.
4. Create a knowledge base.
5. See task status.
6. View generated output placeholders.
7. Use clean API contracts that later services can call.

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
