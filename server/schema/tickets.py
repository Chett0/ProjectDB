from app.extensions import ma
from models import Ticket


class TicketSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Ticket

    id = ma.Integer()
    flight = ma.Nested('FlightSchema')
    passenger = ma.Nested('PassengerSchema')
    final_cost = ma.Decimal(as_string=True)
    purchase_date = ma.DateTime(format='iso')
    seat = ma.Nested('SeatSchema')
    extras = ma.Nested('ExtraSchema', many=True)


ticket_schema = TicketSchema()
tickets_schema = TicketSchema(many=True)
