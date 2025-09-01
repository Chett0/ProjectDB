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
