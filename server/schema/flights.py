from marshmallow import Schema, fields
from app.extensions import ma
from models import Flight
from schema import RouteSchema, AircraftSchema

class FlightSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Flight
    
    id = ma.Integer()
    route = ma.Nested('RouteSchema')
    aircraft = ma.Nested('AircraftSchema')
    base_price = ma.Decimal(as_string=True)
    duration = ma.Integer()
    departure_time = ma.DateTime(format="iso")
    arrival_time = ma.DateTime(format="iso")

flight_schema = FlightSchema()
flights_schema = FlightSchema(many=True)


class JourneySchema(Schema):
    first_flight = fields.Nested('FlightSchema')
    second_flight = fields.Nested('FlightSchema')
    total_duration = fields.Float()
    total_price = fields.Float()

journey_schema = JourneySchema()
journeys_schema = JourneySchema(many=True)


class SearchFlightsSchema(Schema):
    outbound_journeys = fields.Nested(JourneySchema, many=True)
    return_journeys = fields.Nested(JourneySchema, many=True)


search_flight_schema = SearchFlightsSchema()
search_flights_schema = SearchFlightsSchema(many=True)