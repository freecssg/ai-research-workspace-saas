"""add crud api support fields

Revision ID: 202605020001
Revises: 202605010001
Create Date: 2026-05-02 00:01:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "202605020001"
down_revision: str | None = "202605010001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "files",
        sa.Column(
            "source_type",
            sa.Enum(
                "upload",
                name="file_source_type",
                native_enum=False,
                create_constraint=True,
            ),
            server_default="upload",
            nullable=False,
        ),
    )
    op.add_column("tasks", sa.Column("result_ref", sa.String(length=1024), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "result_ref")
    op.drop_column("files", "source_type")
