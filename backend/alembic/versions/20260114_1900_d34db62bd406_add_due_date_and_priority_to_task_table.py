"""add due_date and priority to task table

Revision ID: d34db62bd406
Revises: e8275e6c143c
Create Date: 2026-01-14 19:00:45.426280

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd34db62bd406'
down_revision = 'e8275e6c143c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add due_date and priority columns to tasks table
    op.add_column('tasks', sa.Column('due_date', sa.Date(), nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'))


def downgrade() -> None:
    # Remove due_date and priority columns from tasks table
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'due_date')
