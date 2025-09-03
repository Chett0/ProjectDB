from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Flight, Route, Airport, AircraftClass, Seat, SeatState, UserRole
# from flask_restful import Resource
from schema import flights_schema, flight_schema, FlightSchema
from datetime import datetime
from sqlalchemy import func, desc
from marshmallow import Schema, fields

from middleware.auth import roles_required

class SearchFlightsSchema(Schema):
    first_flight = fields.Nested('FlightSchema')
    second_flight = fields.Nested('FlightSchema')
    total_duration = fields.Float()
    total_price = fields.Float()

search_flight_shcema = SearchFlightsSchema()
search_flights_shcema = SearchFlightsSchema(many=True)

flights_bp = Blueprint('flight', __name__)

@flights_bp.route('/flights', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_flight():
    try:
        data = request.get_json()

        route_id = data["route_id"]
        aircraft_id = data["aircraft_id"]

        departure_time = datetime.strptime(data["departure_time"], "%Y-%m-%d %H:%M")     
        arrival_time = datetime.strptime(data["arrival_time"], "%Y-%m-%d %H:%M")
        base_price = data["base_price"]
        duration_seconds = (arrival_time - departure_time).total_seconds()

        new_flight = Flight(
            route_id=route_id,
            aircraft_id=aircraft_id,
            departure_time=departure_time,
            arrival_time=arrival_time,
            base_price=base_price,
            duration_seconds=duration_seconds
        )

        db.session.add(new_flight)

        classes = AircraftClass.query.filter_by(aircraft_id=aircraft_id).order_by(desc(AircraftClass.price_multiplier)).all()

        letter = 'A'
        rowNumber = 1

        for c in classes:
            for p in range(c.nSeats):
                new_seat = Seat(
                    number= str(rowNumber) + letter,
                    flight_id=new_flight.id,
                    class_id=c.id,
                    state=SeatState.AVAILABLE,
                    price=base_price*c.price_multiplier
                )

                db.session.add(new_seat)

                letter = chr(ord(letter) + 1)
                if letter == 'G':
                    rowNumber+=1
                    letter = 'A'


        db.session.commit()

        return jsonify({"message":"Flight created successfully"}), 201

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"message":"Error creating flight"}), 500
    

@flights_bp.route('/flights', methods=['GET'])
def get_flights():
    try:
        page_number = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        sort_by = request.args.get('sort', 'departure_time')
        order = request.args.get('order', 'asc').lower()
        departure_airport_code = request.args.get('from')
        arrival_airport_code = request.args.get('to')
        layovers = request.args.get('layovers', 1, type=int)
        departure_date = request.args.get('departure_date')
        round_trip = request.args.get('round_trip', 0, type=int)
        # arrival_date = request.args.get('arrival_date')

        sort = {'sort_by' : sort_by, 'order' : order}

        if not departure_airport_code or not arrival_airport_code:
            return jsonify({
                'message': 'Both departure and arrival airport codes are required'
            }), 400

        departure_airport = Airport.query.filter_by(code=departure_airport_code).first()
        if not departure_airport:
            return jsonify({"message":"Departure airport not found"}), 404

        arrival_airport = Airport.query.filter_by(code=arrival_airport_code).first()
        if not arrival_airport:
            return jsonify({"message":"Arrival airport not found"}), 404
        
        flights_query = Flight.query 

        if not departure_date:
            return jsonify({"message":"Departure date required"}), 404
        formatted_departure_date = datetime.strptime(departure_date, "%Y-%m-%d")
        flights_query = flights_query.where(func.date(Flight.departure_time) == formatted_departure_date.date())
        
        # if arrival_date:
        #     formatted_arrival_date = datetime.strptime(arrival_date, "%Y-%m-%d")
        #     flights_query = flights_query.where(Flight.arrival_time.date() == departure_date.date())

        direct_route = Route.query.filter_by(
            departure_airport_id=departure_airport.id,
            arrival_airport_id=arrival_airport.id
        ).first()

        journeys = []

        if direct_route:
            direct_flights = flights_query.filter_by(route_id=direct_route.id).all()
            for flight in direct_flights:
                flight_duration = (flight.arrival_time - flight.departure_time).total_seconds() // 3600
                # flight.flight_type = 'direct'
                journeys.append({
                    "first_flight":flight,
                    "total_duration":flight_duration
                })


        if(layovers):

            min_connection_seconds = 2 * 3600
            max_connection_seconds = 12 * 3600

            departure_routes = Route.query.where(
                (Route.departure_airport_id == departure_airport.id) &
                (Route.arrival_airport_id != arrival_airport.id)).all()

            arrival_routes = Route.query.where(
                (Route.arrival_airport_id == arrival_airport.id) &
                (Route.departure_airport_id != departure_airport.id)).all()

            for dep_route in departure_routes:
                for arr_route in arrival_routes:

                    if dep_route.arrival_airport_id == arr_route.departure_airport_id:
                        first_flights = flights_query.filter_by(route_id=dep_route.id).all()
                        second_flights = flights_query.filter_by(route_id=arr_route.id).all()

                        for first_flight in first_flights:
                            for second_flight in second_flights:

                                layovers_time_seconds = (second_flight.departure_time - first_flight.arrival_time).total_seconds()

                                if layovers_time_seconds >= min_connection_seconds and layovers_time_seconds <= max_connection_seconds:

                                    total_journey_duration = (second_flight.arrival_time - first_flight.departure_time).total_seconds() // 3600

                                    journeys.append({
                                        "first_flight":first_flight, 
                                        "second_flight":second_flight,
                                        "total_duration":total_journey_duration
                                    })

        total_flights_number = len(journeys)
        if total_flights_number == 0:
            return jsonify({
                'message':'Fligths retrieved successfully',
                'flights' : [],
                'total_pages' : 0 
            }), 200
        
        total_pages = (total_flights_number + limit - 1) // limit 
        offset = (page_number - 1) * limit

        # flights = flights_query.offset(offset=offset).limit(limit=limit).all()

        sort_journeys(journeys, sort)

        journeys[offset:offset + limit]

        return jsonify({
            "message":"Fligths retrieved successfully",
            "flights":search_flights_shcema.dump(journeys),
            "total_pages":total_pages
        }), 200



    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving flights"}), 500
    


@flights_bp.route('/flights/<int:flight_id>', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_flight_by_id(flight_id):  
    try:
        flight = Flight.query.filter_by(id=flight_id).first()
        if not flight:
            return jsonify({"message": "Flight not found"}), 404
        
        
        
        return jsonify({"message":"Flight retrieved successfully", "flight": flight_schema.dump(flight)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving flight"}), 500



def sort_journeys(journeys, sort_params):

    if(sort_params['order'] == "asc"):

        if(sort_params["sort_by"]=="departure_time"):
            journeys.sort(key=lambda x: x["first_flight"].departure_time)
        elif(sort_params["sort_by"]=="price"):
            journeys.sort(key=lambda x: x["total_price"])
        elif(sort_params["sort_by"]=="duration"):
            journeys.sort(key=lambda x: x["total_duration"])

    elif(sort_params["order"] == "desc"):

        if(sort_params["sort_by"]=="departure_time"):
            journeys.sort(key=lambda x: x["first_flight"].departure_time, reverse=True)
        elif(sort_params["sort_by"]=="price"):
            journeys.sort(key=lambda x: x["total_price"], reverse=True)
        elif(sort_params["sort_by"]=="duration"):
            journeys.sort(key=lambda x: x["total_duration"], reverse=True)




def get_seats_flight(flight_id):
    try:
        seats = Seat.query.filter_by(flight_id=flight_id).all()
        return seats

    except Exception as e:
        print(e)
        return None