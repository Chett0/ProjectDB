from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List
from .users import User

class Passenger(db.Model):
    __tablename__ = 'passengers'

    id: Mapped[int] = mapped_column(db.ForeignKey("users.id", ondelete="CASCADE"),primary_key=True)

    name: Mapped[str] = mapped_column(db.String(50), nullable=False)
    surname: Mapped[str] = mapped_column(db.String(50), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="passenger", uselist=False)