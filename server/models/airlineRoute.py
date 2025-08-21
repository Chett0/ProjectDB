from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List

class AirlineRoute(db.Model):
    __tablename__ = 'airlineRoute'

    airline_id: Mapped[int] = mapped_column(db.ForeignKey("airlines.id", ondelete="CASCADE"),primary_key=True)
    
    airline : Mapped["Airline"] = relationship(
        "Airline",
        back_populates="airlines_routes",
        foreign_keys=[airline_id]
    )

    route_id: Mapped[int] = mapped_column(db.ForeignKey("routes.id", ondelete="CASCADE"),primary_key=True)

    route : Mapped["Route"] = relationship(
        "Route",
        back_populates="airlines_routes",
        foreign_keys=[route_id]
    )
