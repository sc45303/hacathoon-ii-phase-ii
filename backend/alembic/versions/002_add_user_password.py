"""Add password_hash to users table

Revision ID: 002_add_user_password
Revises: 001_initial
Create Date: 2026-01-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_user_password'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade():
    """Add password_hash column to users table."""
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=False))


def downgrade():
    """Remove password_hash column from users table."""
    op.drop_column('users', 'password_hash')
