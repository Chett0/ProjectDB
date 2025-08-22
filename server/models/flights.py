from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy import DateTime
from datetime import datetime

  
class Flight(db.Model):
    __tablename__ = 'flights'

    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    route_id : Mapped[int] = mapped_column(db.ForeignKey("routes.id"))
    route : Mapped["Route"] = relationship(
        "Route", 
        foreign_keys=[route_id]
    )

    aircraft_id : Mapped[int] = mapped_column(db.ForeignKey("aircrafts.id"))
    aircraft : Mapped["Aicraft"] = relationship(
        "Aircraft", 
        foreign_keys=[aircraft_id]
    )

    departure_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=False)
    arrival_time : Mapped[datetime] = mapped_column(db.DateTime, nullable=False)



