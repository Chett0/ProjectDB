from app.extensions import ma
from models import Route
from schema import AirlineSchema

class AircraftSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Route
    
    id = ma.Integer()
    model = ma.String()
    nSeats = ma.Integer()
    airline = ma.Nested('AirlineSchema')

aircraft_schema = AircraftSchema()
aircrafts_schema = AircraftSchema(many=True)