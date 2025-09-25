from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .seats import Seat
    from .extras import TicketExtra
    from .flights import Flight
    from .passenger import Passenger

class BookingState(Enum):
    PENDING = "Pending"    
    CONFIRMED = "Confirmed" 
    CANCELLED = "Cancelled" 

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

    seat_id: Mapped[Optional[int]] = mapped_column(db.ForeignKey('seats.id', ondelete='SET NULL'), nullable=True, index=True)
    seat: Mapped[Optional['Seat']] = relationship('Seat', foreign_keys=[seat_id])

    final_cost: Mapped[float] = mapped_column(db.Numeric(10, 2), nullable=False)
    purchase_date: Mapped[datetime] = mapped_column(db.DateTime, nullable=True)

    state: Mapped[BookingState] = mapped_column(db.Enum(BookingState, name="bookingstate", create_type=True), nullable=False)
    # Create the type before the migration otherwhise it generates an error
    # CREATE TYPE bookingstate AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
    
    ticket_extra: Mapped[List['TicketExtra']] = relationship(
        'TicketExtra', 
        back_populates='ticket'
    )




