from app.extensions import ma
from models import Airline
from schema import AirlineSchema

class AircraftSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Airline
    
    id = ma.Integer()
    model = ma.String()
    nSeats = ma.Integer()
    airline = ma.Nested('AirlineSchema')

aircraft_schema = AircraftSchema()
aircrafts_schema = AircraftSchema(many=True)