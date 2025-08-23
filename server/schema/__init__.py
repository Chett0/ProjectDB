from .airlines import AirlineSchema
from .aircrafts import AircraftSchema, aircraft_schema, aircrafts_schema
from .airports import AirportSchema, airport_schema, airports_schema
from .routes import RouteSchema, route_schema, routes_schema
from .flights import FlightSchema, flight_schema, flights_schema

__all__ = [
    'AirlineSchema', 
    'AircraftSchema', 
    'aircraft_schema',
    'aircrafts_schema',
    'AirportSchema', 
    'airport_schema',
    'airports_schema',
    'RouteSchema', 
    'route_schema',
    'routes_schema'
    'FlightSchema',
    'flight_schema',
    'flights_schema'
]