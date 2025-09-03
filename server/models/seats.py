from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .flights import Flight
    from .classes import AircraftClass

class SeatState(Enum):
    AVAILABLE = "Available"
    RESERVED = "Reserved"
    BOOKED = "Booked"



class Seat(db.Model):
    __tablename__ = 'seats'


    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    number: Mapped[str] = mapped_column(db.String(20), nullable=False)

    flight_id: Mapped[int] = mapped_column(db.ForeignKey('flights.id', ondelete='CASCADE'), nullable=False, index=True)
    flight: Mapped['Flight'] = relationship('Flight', foreign_keys=[flight_id])

    class_id: Mapped[int] = mapped_column(db.ForeignKey('aircraft_classes.id', ondelete='SET NULL'), nullable=True, index=True)
    aircraft_class: Mapped[Optional['AircraftClass']] = relationship('AircraftClass', foreign_keys=[class_id])

    state: Mapped[SeatState] = mapped_column(db.Enum(SeatState, name="seatstate"), nullable=False)

    price: Mapped[int] = mapped_column(nullable=True)

