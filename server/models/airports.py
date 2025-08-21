from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List
  
class Airport(db.Model):
    __tablename__ = 'airports'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name : Mapped[str] = mapped_column(db.String(255), nullable=False, unique=True)
    code : Mapped[str] = mapped_column(db.String(3), nullable=False, unique=True)
    city : Mapped[str] = mapped_column(db.String(100), nullable=False)
    country : Mapped[str] = mapped_column(db.String(100), nullable=False)

    departure_route: Mapped[List["Route"]] = relationship(
        back_populates="departure_airport",
        foreign_keys="[Route.departure_airport_id]"
    )

    arrival_route: Mapped[List["Route"]] = relationship(
        back_populates="arrival_airport",
        foreign_keys="[Route.arrival_airport_id]"
    )