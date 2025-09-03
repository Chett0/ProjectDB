from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .airports import Airport
    from .airlineRoute import AirlineRoute
    from .flights import Flight

  
class Route(db.Model):
    __tablename__ = 'routes'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    departure_airport_id : Mapped[int] = mapped_column(db.ForeignKey("airports.id"))
    departure_airport : Mapped["Airport"] = relationship(
        "Airport", 
        back_populates="departure_route",
        foreign_keys=[departure_airport_id]
    )
    arrival_airport_id : Mapped[int] = mapped_column(db.ForeignKey("airports.id"))
    arrival_airport : Mapped["Airport"] = relationship(
        "Airport", 
        foreign_keys=[arrival_airport_id]
    )

    airlines_routes: Mapped[List["AirlineRoute"]] = relationship(
        "AirlineRoute",
        back_populates="route",
        cascade="all, delete-orphan",
        lazy="joined"
    )

    flights: Mapped[List["Flight"]] = relationship(
        "Flight",
        back_populates="route"
    )
    