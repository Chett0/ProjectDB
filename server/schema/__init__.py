from .airlines import AirlineSchema
from .aircrafts import AircraftSchema, aircraft_schema, aircrafts_schema
from .airports import AirportSchema
from .routes import RouteSchema, route_schema, routes_schema
from .flights import FlightSchema, flight_schema, flights_schema

__all__ = [
    'AirlineSchema', 
    'AircraftSchema', 
    'aircraft_schema',
    'aircrafts_schema',
    'AirportSchema', 
    'RouteSchema', 
    'route_schema',
    'routes_schema'
    'FlightSchema',
    'flight_schema',
    'flights_schema'
]