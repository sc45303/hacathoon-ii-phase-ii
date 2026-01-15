"""add metadata column to message table

Revision ID: a3c44bf7ddcb
Revises: 37ca2e18468d
Create Date: 2026-01-14 17:02:51.060200

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a3c44bf7ddcb'
down_revision = '37ca2e18468d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add metadata column to message table
    op.add_column('message', sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    # Remove metadata column from message table
    op.drop_column('message', 'metadata')
