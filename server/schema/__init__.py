from .airlines import AirlineSchema
from .aircrafts import AircraftSchema, aircraft_schema, aircrafts_schema
from .airports import AirportSchema, airport_schema, airports_schema
from .routes import RouteSchema, route_schema, routes_schema
from .flights import FlightSchema, flight_schema, flights_schema, JourneySchema, journey_schema, journeys_schema, search_flight_schema, search_flights_schema, SearchFlightsSchema
from .tickets import TicketSchema, ticket_schema, tickets_schema
from .classes import AircraftClassSchema, aircraft_class_schema, aircraft_classes_schema
from .seats import SeatSchema, seat_schema, seats_schema
from .extras import ExtraSchema, extra_schema, extras_schema

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
    'routes_schema',
    'FlightSchema',
    'flight_schema',
    'flights_schema',
    'JourneySchema',
    'journey_schema',
    'journeys_schema',
    'search_flight_schema',
    'search_flights_schema',
    'SearchFlightsSchema',
    'TicketSchema',
    'ticket_schema',
    'tickets_schema',
    'AircraftClassSchema',
    'aircraft_class_schema',
    'aircraft_classes_schema',
    'SeatSchema',
    'seat_schema',
    'seats_schema',
    'ExtraSchema',
    'extra_schema',
    'extras_schema'
]