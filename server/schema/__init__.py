from .airlines import AirlineSchema
from .aircrafts import AircraftSchema
from .airports import AirportSchema
from .routes import RouteSchema, route_schema, routes_schema
# from .flights import FlightSchema

__all__ = [
    'AirlineSchema', 
    'AircraftSchema', 
    'AirportSchema', 
    'RouteSchema', 
    'route_schema',
    'routes_schema',
    # 'FlightSchema'
]