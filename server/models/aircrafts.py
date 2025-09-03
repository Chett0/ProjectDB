from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .airlines import Airline
    from .flights import Flight
    from .classes import AircraftClass


class Aircraft(db.Model):
    __tablename__ = 'aircrafts'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    model : Mapped[str] = mapped_column(nullable=False, unique=True)
    nSeats : Mapped[int] = mapped_column(nullable=False)

    airline_id: Mapped[int] = mapped_column(db.ForeignKey("airlines.id"), index=True)
    airline : Mapped["Airline"] = relationship("Airline")
    
    flights : Mapped[List["Flight"]] = relationship(
        "Flight",
        back_populates="aircraft"
    )
    
    classes: Mapped[List['AircraftClass']] = relationship(
        'AircraftClass',
        back_populates='aircraft'
    )