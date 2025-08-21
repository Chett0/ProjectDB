from app.extensions import ma
from models import Route
from schema import AirportSchema, AirlineSchema

class RouteSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Route
    
    id = ma.Integer()
    departure_airport = ma.Nested('AirportSchema')
    arrival_airport = ma.Nested('AirportSchema')
    airline = ma.Nested('AirlineSchema')

route_schema = RouteSchema()
routes_schema = RouteSchema(many=True)