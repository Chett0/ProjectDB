from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from .flights import Flight
from .passenger import Passenger


class Ticket(db.Model):
    __tablename__ = 'tickets'
    __table_args__ = (
        db.Index('ix_tickets_flight_passenger', 'flight_id', 'passenger_id'),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    flight_id: Mapped[int] = mapped_column(db.ForeignKey("flights.id", ondelete="CASCADE"), nullable=False, index=True)
    flight: Mapped["Flight"] = relationship(
        "Flight",
        foreign_keys=[flight_id]
    )

    passenger_id: Mapped[int] = mapped_column(db.ForeignKey("passengers.id", ondelete="CASCADE"), nullable=False, index=True)
    passenger: Mapped["Passenger"] = relationship(
        "Passenger",
        foreign_keys=[passenger_id]
    )

    final_cost: Mapped[float] = mapped_column(db.Numeric(10, 2), nullable=False)
    purchase_date: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow, nullable=False)

    extras: Mapped[Optional[dict]] = mapped_column(db.JSON, nullable=True)
