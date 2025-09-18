from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from decimal import Decimal
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .aircrafts import Aircraft
    from .extras import ClassExtra

class AircraftClass(db.Model):
    __tablename__ = 'aircraft_classes'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    aircraft_id: Mapped[int] = mapped_column(db.ForeignKey('aircrafts.id', ondelete='CASCADE'), nullable=False)
    aircraft: Mapped['Aircraft'] = relationship('Aircraft', back_populates='classes', foreign_keys=[aircraft_id])

    name: Mapped[str] = mapped_column(db.String(50), nullable=False)
    nSeats: Mapped[int] = mapped_column(nullable=False)
    price_multiplier: Mapped[Decimal] = mapped_column(db.Numeric(5,2), nullable=False, default=1)

    active: Mapped[bool] = mapped_column(default=True)
    deletion_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=True, default=None)
