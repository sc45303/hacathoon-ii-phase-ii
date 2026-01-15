"""add_conversation_and_message_tables

Revision ID: 48b10b49730f
Revises: 002_add_user_password
Create Date: 2026-01-14 10:44:27.010796

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '48b10b49730f'
down_revision = '002_add_user_password'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create conversation table
    op.create_table(
        'conversation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_conversation_user_id', 'conversation', ['user_id'])
    op.create_index('ix_conversation_created_at', 'conversation', ['created_at'])

    # Create message table
    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_message_conversation_id', 'message', ['conversation_id'])
    op.create_index('ix_message_timestamp', 'message', ['timestamp'])


def downgrade() -> None:
    # Drop message table first (due to foreign key dependency)
    op.drop_index('ix_message_timestamp', table_name='message')
    op.drop_index('ix_message_conversation_id', table_name='message')
    op.drop_table('message')

    # Drop conversation table
    op.drop_index('ix_conversation_created_at', table_name='conversation')
    op.drop_index('ix_conversation_user_id', table_name='conversation')
    op.drop_table('conversation')
