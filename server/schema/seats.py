from app.extensions import ma
from models import Seat


class SeatSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Seat

    id = ma.auto_field()
    number = ma.auto_field()

    flight = ma.Nested('FlightSchema', only=('id', 'departure_time', 'arrival_time'))
    aircraft_class = ma.Nested('AircraftClassSchema', only=('id', 'name', 'price_multiplier'))

    state = ma.auto_field()
    price = ma.Integer()


seat_schema = SeatSchema()
seats_schema = SeatSchema(many=True)
