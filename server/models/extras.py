from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from decimal import Decimal
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .tickets import Ticket
    from .classes import AircraftClass
    from .airlines import Airline


# association table for ticket and extra (many-to-many)
class TicketExtra(db.Model):
    __tablename__ = 'ticket_extra'

    ticket_id: Mapped[int] = mapped_column(db.ForeignKey("tickets.id", ondelete="CASCADE"),primary_key=True)
    
    ticket : Mapped["Ticket"] = relationship(
        "Ticket",
        back_populates="ticket_extra",
        foreign_keys=[ticket_id]
    )
    
    extra_id: Mapped[int] = mapped_column(db.ForeignKey("extras.id", ondelete="CASCADE"),primary_key=True)
    
    extra : Mapped["Extra"] = relationship(
        "Extra",
        back_populates="ticket_extra",
        foreign_keys=[extra_id]
    )



class Extra(db.Model):
    __tablename__ = 'extras'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    price: Mapped[Decimal] = mapped_column(db.Numeric(10,2), nullable=False, default=0)


    ticket_extra: Mapped[List['TicketExtra']] = relationship(
        'TicketExtra', 
        back_populates='extra'
    )
    
    airline_id: Mapped[int] = mapped_column(db.ForeignKey('airlines.id', ondelete="CASCADE"), nullable=False)

    airline : Mapped["Airline"] = relationship(
        "Airline",
        back_populates="extras",
        foreign_keys=[airline_id]
    )

    active: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=True)
    deletion_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=True, default=None)