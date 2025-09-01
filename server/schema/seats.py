from app.extensions import ma
from models import Seat


class SeatSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Seat

    nSeat = ma.Integer()
    flight = ma.Nested('FlightSchema', only=('id', 'departure_time', 'arrival_time'))
    aircraft_class = ma.Nested('AircraftClassSchema', only=('id', 'name', 'price_multiplier'))
    occupied = ma.Boolean()
    label = ma.String()


seat_schema = SeatSchema()
seats_schema = SeatSchema(many=True)
