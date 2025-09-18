from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .aircrafts import Aircraft
    from .airlineRoute import AirlineRoute
    from .extras import Extra

class Airline(db.Model):
    __tablename__ = 'airlines'

    id: Mapped[int] = mapped_column(db.ForeignKey("users.id", ondelete="CASCADE"),primary_key=True)

    name: Mapped[str] = mapped_column(db.String(50), nullable=False, index=True)
    code: Mapped[str] = mapped_column(db.String(3), nullable=False, index=True)

    aircrafts: Mapped[List['Aircraft']] = relationship(
        "Aircraft",
        back_populates="airline"
    )

    airlines_routes: Mapped[List["AirlineRoute"]] = relationship(
        "AirlineRoute",
        back_populates="airline",
    )

    extras : Mapped[List["Extra"]] = relationship(
        "Extra",
        back_populates="airline"
    )

