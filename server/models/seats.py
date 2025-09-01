from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import Optional
from datetime import datetime
from .flights import Flight
from .classes import AircraftClass


class Seat(db.Model):
    __tablename__ = 'seats'

    nSeat: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    flight_id: Mapped[int] = mapped_column(db.ForeignKey('flights.id', ondelete='CASCADE'), nullable=False, index=True)
    flight: Mapped['Flight'] = relationship('Flight', foreign_keys=[flight_id])

    class_id: Mapped[int] = mapped_column(db.ForeignKey('aircraft_classes.id', ondelete='SET NULL'), nullable=True, index=True)
    aircraft_class: Mapped[Optional['AircraftClass']] = relationship('AircraftClass', foreign_keys=[class_id])

    occupied: Mapped[bool] = mapped_column(db.Boolean, nullable=False, default=False)

    label: Mapped[Optional[str]] = mapped_column(db.String(10), nullable=True)

