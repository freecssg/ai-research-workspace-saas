"""correct research lab domain model

Revision ID: 202605020002
Revises: 202605020001
Create Date: 2026-05-02 00:02:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "202605020002"
down_revision: str | None = "202605020001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _id_column() -> sa.Column:
    return sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False)


def _created_at_column() -> sa.Column:
    return sa.Column(
        "created_at",
        sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
        nullable=False,
    )


def _updated_at_column() -> sa.Column:
    return sa.Column(
        "updated_at",
        sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
        nullable=False,
    )


def _enum(name: str, values: Sequence[str]) -> sa.Enum:
    return sa.Enum(*values, name=name, native_enum=False, create_constraint=True)


def _drop_legacy_tables() -> None:
    for table_name in (
        "agent_outputs",
        "tasks",
        "knowledge_bases",
        "files",
        "projects",
        "workspaces",
        "users",
    ):
        op.drop_table(table_name)


def upgrade() -> None:
    _drop_legacy_tables()

    op.create_table(
        "users",
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            _enum("user_role", ("admin", "member")),
            server_default="member",
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "knowledge_bases",
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("research_domain", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            _enum("knowledge_base_status", ("draft", "building", "ready", "failed", "archived")),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_knowledge_bases_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_knowledge_bases")),
    )
    op.create_index(
        op.f("ix_knowledge_bases_created_by_id"),
        "knowledge_bases",
        ["created_by_id"],
    )

    op.create_table(
        "projects",
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("output_objective", sa.Text(), nullable=False),
        sa.Column(
            "project_type",
            _enum(
                "project_type",
                (
                    "literature_review",
                    "reb_application",
                    "data_analysis",
                    "presentation",
                    "manuscript",
                    "research_proposal",
                    "custom",
                ),
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            _enum("project_status", ("draft", "active", "completed", "archived")),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_projects_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_projects")),
    )
    op.create_index(op.f("ix_projects_created_by_id"), "projects", ["created_by_id"])

    op.create_table(
        "workspaces",
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("research_topic", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            _enum("workspace_status", ("draft", "analyzing", "ready", "failed", "archived")),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_workspaces_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_workspaces_knowledge_base_id_knowledge_bases"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workspaces")),
        sa.UniqueConstraint(
            "knowledge_base_id",
            "name",
            name="uq_workspaces_knowledge_base_id_name",
        ),
    )
    op.create_index(
        op.f("ix_workspaces_created_by_id"),
        "workspaces",
        ["created_by_id"],
    )
    op.create_index(
        op.f("ix_workspaces_knowledge_base_id"),
        "workspaces",
        ["knowledge_base_id"],
    )

    op.create_table(
        "source_materials",
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("storage_path", sa.String(length=1024), nullable=True),
        sa.Column(
            "source_kind",
            _enum(
                "source_kind",
                (
                    "paper",
                    "dataset",
                    "note",
                    "transcript",
                    "report",
                    "webpage",
                    "experiment_result",
                    "other",
                ),
            ),
            nullable=False,
        ),
        sa.Column(
            "visibility",
            _enum("source_visibility", ("public", "private", "lab_internal")),
            server_default="lab_internal",
            nullable=False,
        ),
        sa.Column("content_type", sa.String(length=255), nullable=True),
        sa.Column("file_size", sa.BigInteger(), nullable=True),
        sa.Column("source_url", sa.String(length=2048), nullable=True),
        sa.Column("citation_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "processing_status",
            _enum(
                "source_processing_status",
                ("uploaded", "queued", "processing", "analyzed", "indexed", "failed"),
            ),
            server_default="uploaded",
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_source_materials_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_source_materials_knowledge_base_id_knowledge_bases"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_source_materials_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_source_materials")),
    )
    op.create_index(
        op.f("ix_source_materials_created_by_id"),
        "source_materials",
        ["created_by_id"],
    )
    op.create_index(
        op.f("ix_source_materials_knowledge_base_id"),
        "source_materials",
        ["knowledge_base_id"],
    )
    op.create_index(
        op.f("ix_source_materials_workspace_id"),
        "source_materials",
        ["workspace_id"],
    )

    op.create_table(
        "ai_analysis_agent_configs",
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column(
            "agent_type",
            _enum(
                "analysis_agent_type",
                (
                    "paper_analysis",
                    "dataset_analysis",
                    "method_extraction",
                    "theory_mapping",
                    "citation_analysis",
                    "trend_analysis",
                    "rag_indexing",
                    "graph_building",
                    "custom",
                ),
            ),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "target_source_kind",
            _enum(
                "agent_target_source_kind",
                (
                    "paper",
                    "dataset",
                    "note",
                    "transcript",
                    "report",
                    "webpage",
                    "experiment_result",
                    "other",
                ),
            ),
            nullable=True,
        ),
        sa.Column("analysis_goal", sa.Text(), nullable=True),
        sa.Column("extraction_schema", sa.JSON(), nullable=True),
        sa.Column("output_format", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_ai_analysis_agent_configs_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_ai_analysis_agent_configs_knowledge_base_id_knowledge_bases"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_ai_analysis_agent_configs_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ai_analysis_agent_configs")),
    )
    op.create_index(
        op.f("ix_ai_analysis_agent_configs_created_by_id"),
        "ai_analysis_agent_configs",
        ["created_by_id"],
    )
    op.create_index(
        op.f("ix_ai_analysis_agent_configs_knowledge_base_id"),
        "ai_analysis_agent_configs",
        ["knowledge_base_id"],
    )
    op.create_index(
        op.f("ix_ai_analysis_agent_configs_workspace_id"),
        "ai_analysis_agent_configs",
        ["workspace_id"],
    )

    op.create_table(
        "thought_chains",
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "chain_type",
            _enum(
                "thought_chain_type",
                (
                    "theory_path",
                    "method_relation",
                    "concept_relation",
                    "research_gap",
                    "research_question",
                    "argument_structure",
                    "data_theory_mapping",
                    "custom",
                ),
            ),
            nullable=False,
        ),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_thought_chains_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_thought_chains_knowledge_base_id_knowledge_bases"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_thought_chains_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_thought_chains")),
    )
    op.create_index(op.f("ix_thought_chains_created_by_id"), "thought_chains", ["created_by_id"])
    op.create_index(
        op.f("ix_thought_chains_knowledge_base_id"),
        "thought_chains",
        ["knowledge_base_id"],
    )
    op.create_index(op.f("ix_thought_chains_workspace_id"), "thought_chains", ["workspace_id"])

    op.create_table(
        "project_team_members",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "member_role",
            _enum("project_member_role", ("leader", "editor", "viewer")),
            server_default="viewer",
            nullable=False,
        ),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_project_team_members_project_id_projects"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_project_team_members_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_project_team_members")),
        sa.UniqueConstraint(
            "project_id",
            "user_id",
            name="uq_project_team_members_project_id_user_id",
        ),
    )
    op.create_index(
        op.f("ix_project_team_members_project_id"),
        "project_team_members",
        ["project_id"],
    )
    op.create_index(
        op.f("ix_project_team_members_user_id"),
        "project_team_members",
        ["user_id"],
    )

    op.create_table(
        "project_source_selections",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("source_material_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("thought_chain_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("selection_reason", sa.Text(), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_project_source_selections_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_project_source_selections_knowledge_base_id_knowledge_bases"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_project_source_selections_project_id_projects"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["source_material_id"],
            ["source_materials.id"],
            name=op.f("fk_project_source_selections_source_material_id_source_materials"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["thought_chain_id"],
            ["thought_chains.id"],
            name=op.f("fk_project_source_selections_thought_chain_id_thought_chains"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_project_source_selections_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_project_source_selections")),
    )
    for column_name in (
        "created_by_id",
        "knowledge_base_id",
        "project_id",
        "source_material_id",
        "thought_chain_id",
        "workspace_id",
    ):
        op.create_index(
            op.f(f"ix_project_source_selections_{column_name}"),
            "project_source_selections",
            [column_name],
        )

    op.create_table(
        "project_workflows",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "workflow_type",
            _enum(
                "workflow_type",
                (
                    "literature_review",
                    "reb_application",
                    "data_analysis",
                    "presentation",
                    "manuscript",
                    "custom",
                ),
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            _enum("workflow_status", ("draft", "running", "completed", "failed", "paused")),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_project_workflows_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_project_workflows_project_id_projects"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_project_workflows")),
    )
    op.create_index(
        op.f("ix_project_workflows_created_by_id"),
        "project_workflows",
        ["created_by_id"],
    )
    op.create_index(op.f("ix_project_workflows_project_id"), "project_workflows", ["project_id"])

    op.create_table(
        "project_workflow_steps",
        sa.Column("workflow_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("step_order", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "agent_type",
            _enum(
                "workflow_step_agent_type",
                (
                    "paper_analysis",
                    "dataset_analysis",
                    "method_extraction",
                    "theory_mapping",
                    "citation_analysis",
                    "trend_analysis",
                    "rag_indexing",
                    "graph_building",
                    "custom",
                ),
            ),
            nullable=True,
        ),
        sa.Column(
            "status",
            _enum(
                "workflow_step_status",
                ("pending", "running", "completed", "failed", "skipped"),
            ),
            server_default="pending",
            nullable=False,
        ),
        sa.Column("input_refs", sa.JSON(), nullable=True),
        sa.Column("output_refs", sa.JSON(), nullable=True),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["project_workflows.id"],
            name=op.f("fk_project_workflow_steps_workflow_id_project_workflows"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_project_workflow_steps")),
        sa.UniqueConstraint("workflow_id", "step_order", name="uq_project_workflow_steps_order"),
    )
    op.create_index(
        op.f("ix_project_workflow_steps_workflow_id"),
        "project_workflow_steps",
        ["workflow_id"],
    )

    op.create_table(
        "conversations",
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_conversations_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_conversations_knowledge_base_id_knowledge_bases"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_conversations_project_id_projects"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_conversations_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conversations")),
    )
    for column_name in ("created_by_id", "knowledge_base_id", "project_id", "workspace_id"):
        op.create_index(op.f(f"ix_conversations_{column_name}"), "conversations", [column_name])

    op.create_table(
        "conversation_messages",
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "sender_type",
            _enum("conversation_sender_type", ("user", "assistant", "system", "agent")),
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_refs", sa.JSON(), nullable=True),
        sa.Column("thought_chain_refs", sa.JSON(), nullable=True),
        _id_column(),
        _created_at_column(),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["conversations.id"],
            name=op.f("fk_conversation_messages_conversation_id_conversations"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conversation_messages")),
    )
    op.create_index(
        op.f("ix_conversation_messages_conversation_id"),
        "conversation_messages",
        ["conversation_id"],
    )

    op.create_table(
        "tasks",
        sa.Column(
            "task_scope",
            _enum("task_scope", ("knowledge_base", "workspace", "project", "system")),
            nullable=False,
        ),
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "task_type",
            _enum(
                "task_type",
                (
                    "source_analysis",
                    "wiki_build",
                    "rag_index",
                    "graph_build",
                    "agent_run",
                    "workflow_run",
                    "citation_check",
                    "consistency_check",
                ),
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            _enum("task_status", ("queued", "running", "completed", "failed", "cancelled")),
            server_default="queued",
            nullable=False,
        ),
        sa.Column("progress", sa.Integer(), server_default="0", nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("result_ref", sa.String(length=1024), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100", name=op.f("ck_tasks_progress_percent_range")
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_tasks_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_tasks_knowledge_base_id_knowledge_bases"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_tasks_project_id_projects"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_tasks_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tasks")),
    )
    for column_name in ("created_by_id", "knowledge_base_id", "project_id", "workspace_id"):
        op.create_index(op.f(f"ix_tasks_{column_name}"), "tasks", [column_name])

    op.create_table(
        "agent_outputs",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("knowledge_base_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workflow_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workflow_step_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "output_type",
            _enum(
                "agent_output_type",
                (
                    "wiki_page",
                    "paper_summary",
                    "dataset_summary",
                    "method_summary",
                    "trend_summary",
                    "literature_review",
                    "reb_application",
                    "data_report",
                    "presentation_outline",
                    "manuscript_section",
                    "notes",
                    "custom",
                ),
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_refs", sa.JSON(), nullable=True),
        sa.Column("source_task_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        _id_column(),
        _created_at_column(),
        _updated_at_column(),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_agent_outputs_created_by_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["knowledge_base_id"],
            ["knowledge_bases.id"],
            name=op.f("fk_agent_outputs_knowledge_base_id_knowledge_bases"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_agent_outputs_project_id_projects"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["source_task_id"],
            ["tasks.id"],
            name=op.f("fk_agent_outputs_source_task_id_tasks"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["project_workflows.id"],
            name=op.f("fk_agent_outputs_workflow_id_project_workflows"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workflow_step_id"],
            ["project_workflow_steps.id"],
            name=op.f("fk_agent_outputs_workflow_step_id_project_workflow_steps"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            name=op.f("fk_agent_outputs_workspace_id_workspaces"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_agent_outputs")),
    )
    for column_name in (
        "created_by_id",
        "knowledge_base_id",
        "project_id",
        "source_task_id",
        "workflow_id",
        "workflow_step_id",
        "workspace_id",
    ):
        op.create_index(op.f(f"ix_agent_outputs_{column_name}"), "agent_outputs", [column_name])


def downgrade() -> None:
    for table_name in (
        "agent_outputs",
        "tasks",
        "conversation_messages",
        "conversations",
        "project_workflow_steps",
        "project_workflows",
        "project_source_selections",
        "project_team_members",
        "thought_chains",
        "ai_analysis_agent_configs",
        "source_materials",
        "workspaces",
        "projects",
        "knowledge_bases",
        "users",
    ):
        op.drop_table(table_name)
