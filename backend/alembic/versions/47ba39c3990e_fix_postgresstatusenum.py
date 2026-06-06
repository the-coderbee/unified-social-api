"""fix_postgresstatusenum

Revision ID: 47ba39c3990e
Revises: a84fe190627b
Create Date: 2026-06-06 20:03:59.472585

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47ba39c3990e'
down_revision: Union[str, Sequence[str], None] = 'a84fe190627b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE postresultstatus RENAME VALUE 'FAIL' TO 'FAILED'")

def downgrade() -> None:
    op.execute("ALTER TYPE postresultstatus RENAME VALUE 'FAILED' TO 'FAIL'")
