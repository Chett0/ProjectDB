from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List

class Airline(db.Model):
    __tablename__ = 'airlines'

    id: Mapped[int] = mapped_column(db.ForeignKey("users.id", ondelete="CASCADE"),primary_key=True)

    name: Mapped[str] = mapped_column(db.String(50), nullable=False)
    code: Mapped[str] = mapped_column(db.String(3), nullable=False)

    aircrafts: Mapped[List['Aircraft']] = relationship(
        back_populates="airline"
    )

    routes: Mapped[List["Route"]] = relationship(
        back_populates="airline"
    )
