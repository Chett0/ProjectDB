from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List


class Aircraft(db.Model):
    __tablename__ = 'aircrafts'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    model : Mapped[str] = mapped_column(nullable=False, unique=True)
    nSeats : Mapped[int] = mapped_column(nullable=False)

    airline_id: Mapped[int] = mapped_column(db.ForeignKey("airlines.id"))
    airline : Mapped["Airline"] = relationship("Airline")
    
    # flights : Mapped[List["Flight"]] = relationship(
    #     back_populates="aircraft",
    #     foreign_keys="[Flight.aircraft_id]"
    # )