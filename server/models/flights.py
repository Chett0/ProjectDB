from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy import DateTime
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .routes import Route
    from .aircrafts import Aircraft

  
class Flight(db.Model):
    __tablename__ = 'flights'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    route_id : Mapped[int] = mapped_column(db.ForeignKey("routes.id", ondelete='CASCADE'))
    route : Mapped["Route"] = relationship(
        "Route", 
        foreign_keys=[route_id]
    )

    aircraft_id : Mapped[int] = mapped_column(db.ForeignKey("aircrafts.id"))
    aircraft : Mapped["Aircraft"] = relationship(
        "Aircraft",
        foreign_keys=[aircraft_id]
    )

    departure_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=False)
    arrival_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=False)
    base_price: Mapped[float] = mapped_column(db.Numeric, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(nullable=False)

    active: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False)
    deletion_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=True, default=None)



