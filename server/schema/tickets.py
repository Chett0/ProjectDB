from app.extensions import ma
from models import Ticket


class TicketSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Ticket

    id = ma.Integer()
    flight = ma.Nested('FlightSchema', only=('id', 'departure_time', 'arrival_time'))
    passenger = ma.Nested('PassengerSchema', only=('id', 'name', 'surname'))
    final_cost = ma.Decimal(as_string=True)
    purchase_date = ma.DateTime(format='iso')
    seat = ma.Nested('SeatSchema', only=('nSeat', 'aircraft_class'))
    extras = ma.Nested('ExtraSchema', many=True)


ticket_schema = TicketSchema()
tickets_schema = TicketSchema(many=True)
