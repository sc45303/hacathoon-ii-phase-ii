"""rename metadata to tool_metadata in message table

Revision ID: e8275e6c143c
Revises: a3c44bf7ddcb
Create Date: 2026-01-14 17:12:53.740315

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8275e6c143c'
down_revision = 'a3c44bf7ddcb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename metadata column to tool_metadata
    op.alter_column('message', 'metadata', new_column_name='tool_metadata')


def downgrade() -> None:
    # Rename tool_metadata column back to metadata
    op.alter_column('message', 'tool_metadata', new_column_name='metadata')
