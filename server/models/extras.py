from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from decimal import Decimal
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .tickets import Ticket
    from .classes import AircraftClass


# association table for ticket and extra (many-to-many)
ticket_extras = db.Table(
    'ticket_extras',
    db.Column('ticket_id', db.Integer, db.ForeignKey('tickets.id', ondelete='CASCADE'), primary_key=True),
    db.Column('extra_id', db.Integer, db.ForeignKey('extras.id', ondelete='CASCADE'), primary_key=True),
)

# association table for class and extra (many-to-many)
class_extras = db.Table(
    'class_extras',
    db.Column('class_id', db.Integer, db.ForeignKey('aircraft_classes.id', ondelete='CASCADE'), primary_key=True),
    db.Column('extra_id', db.Integer, db.ForeignKey('extras.id', ondelete='CASCADE'), primary_key=True),
)


class Extra(db.Model):
    __tablename__ = 'extras'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    price: Mapped[Decimal] = mapped_column(db.Numeric(10,2), nullable=False, default=0)

    tickets: Mapped[List['Ticket']] = relationship('Ticket', secondary=ticket_extras, back_populates='extras')
    classes: Mapped[List['AircraftClass']] = relationship('AircraftClass', secondary=class_extras, back_populates='extras')
