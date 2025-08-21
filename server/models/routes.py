from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column

  
class Route(db.Model):
    __tablename__ = 'routes'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    departure_airport_id : Mapped[int] = mapped_column(db.ForeignKey("airports.id"))
    departure_airport : Mapped["Airport"] = relationship("Airport", foreign_keys=[departure_airport_id])
    arrival_airport_id : Mapped[int] = mapped_column(db.ForeignKey("airports.id"))
    arrival_airport : Mapped["Airport"] = relationship("Airport", foreign_keys=[arrival_airport_id])

    airline_id: Mapped[int] = mapped_column(db.ForeignKey("airlines.id"))
    airline : Mapped["Airline"] = relationship("Airline")