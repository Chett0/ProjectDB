from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Flight, Route, Airport, AircraftClass, Seat, SeatState, UserRole
# from flask_restful import Resource
from schema import flights_schema, flight_schema, journeys_schema, seats_schema
from datetime import datetime
from sqlalchemy import func, desc, or_

from middleware.auth import roles_required

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
        # round_trip = request.args.get('round_trip', 0, type=int)
        # arrival_date = request.args.get('arrival_date')

        sort = {'sort_by' : sort_by, 'order' : order}

        if not departure_airport_code or not arrival_airport_code:
            return jsonify({
                'message': 'Both departure and arrival airport codes are required'
            }), 400

        #modify here if you want to search using other parameters.

        departure_airport = Airport.query.filter(
            or_(
                Airport.code.ilike(departure_airport_code),
                Airport.city.ilike(departure_airport_code)
            )
        ).first()
        if not departure_airport:
            return jsonify({"message":"Departure airport not found"}), 404

        arrival_airport = Airport.query.filter(
            or_(
                Airport.code.ilike(arrival_airport_code),
                Airport.city.ilike(arrival_airport_code)
            )
        ).first()
        if not arrival_airport:
            return jsonify({"message":"Arrival airport not found"}), 404
        
        flights_query = Flight.query 

        if not departure_date:
            return jsonify({"message":"Departure date required"}), 404
        formatted_departure_date = datetime.strptime(departure_date, "%Y-%m-%d")
        flights_query = flights_query.where(func.date(Flight.departure_time) == formatted_departure_date.date())

        journeys = search_flights(
            flights_query=flights_query,
            departure_airport=departure_airport,
            arrival_airport=arrival_airport,
            layovers=layovers
        )

        total_flights_number = len(journeys)
        if total_flights_number == 0:
            return jsonify({
                'message':'Fligths retrieved successfully',
                'flights' : [],
                'total_pages' : 0 
            }), 200
        
        total_pages = (total_flights_number + limit - 1) // limit 
        offset = (page_number - 1) * limit

        sort_journeys(journeys, sort)

        journeys[offset:offset + limit]

        return jsonify({
                "message":"Fligths retrieved successfully",
                "flights":journeys_schema.dump(journeys),
                "total_pages":total_pages
            }), 200


    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving flights"}), 500
    
@flights_bp.route('/flight', methods=['GET'])
def get_flight():
    try:
        flight_id = request.args.get('id')

        if not flight_id:
            return jsonify({
                'message': 'flight id missing'
            }), 400

        flight = Flight.query.filter(Flight.id == flight_id).first()
        if not flight:
            return jsonify({"message":"Error flight id"}), 404

        return jsonify({
                "message":"Fligths retrieved successfully",
                "flight": flight_schema.dump(flight)
            }), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving flights"}), 500
    


from flask_jwt_extended import get_jwt_identity
from middleware.auth import roles_required

@flights_bp.route('/flights/count', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_flights_count():
    try:
        airline_id = get_jwt_identity()
        # Trova tutti gli aerei di questa compagnia
        from models import Aircraft
        aircraft_ids = [a.id for a in Aircraft.query.filter_by(airline_id=airline_id).all()]
        if not aircraft_ids:
            return jsonify({"message": "Flights count retrieved", "count": 0}), 200
        # Conta i voli associati a questi aerei
        count = Flight.query.filter(Flight.aircraft_id.in_(aircraft_ids)).count()
        return jsonify({"message": "Flights count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving flights count"}), 500
    
from models import AirlineRoute
# Endpoint per il conteggio delle tratte distinte della compagnia
@flights_bp.route('/flights/routes-count', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_routes_count():
    try:
        airline_id = get_jwt_identity()
        # Conta i route_id distinti associati a questa compagnia
        count = AirlineRoute.query.filter_by(airline_id=airline_id).distinct(AirlineRoute.route_id).count()
        return jsonify({"message": "Routes count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving routes count"}), 500
    

    # Endpoint per il conteggio totale dei voli (solo admin)
@flights_bp.route('/flights/count-all', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_flights_count_all():
    try:
        count = Flight.query.count()
        return jsonify({"message": "Total flights count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving total flights count"}), 500

# Endpoint per il conteggio totale delle tratte (solo admin)
@flights_bp.route('/flights/routes-count-all', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_routes_count_all():
    try:
        from models import Route
        count = Route.query.count()
        return jsonify({"message": "Total routes count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving total routes count"}), 500

@flights_bp.route('/flights/<int:flight_id>', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_flight_by_id(flight_id):  
    try:
        flight = Flight.query.filter_by(id=flight_id).first()
        if not flight:
            return jsonify({"message": "Flight not found"}), 404
        
        
        
        return jsonify({
                "message":"Flight retrieved successfully", 
                "flight": 
                flight_schema.dump(flight)
            }), 200
    
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


def get_free_seats_for_flight(flight_id: int):
    try:
        seats = Seat.query.filter_by(flight_id=flight_id, state=SeatState.AVAILABLE).all()
        return seats
    except Exception as e:
        print(f"Error fetching free seats for flight {flight_id}: {e}")
        return []


def get_occupied_seats_for_flight(flight_id: int):
    try:
        seats = Seat.query.filter(Seat.flight_id == flight_id, Seat.state != SeatState.AVAILABLE).all()
        return seats
    except Exception as e:
        print(f"Error fetching occupied seats for flight {flight_id}: {e}")
        return []



def get_direct_flights(
        flights_query,
        route
):

    flights = []

    direct_flights = flights_query.filter_by(route_id=route.id).all()
    for flight in direct_flights:
        flight_duration = (flight.arrival_time - flight.departure_time).total_seconds() // 3600
        # flight.flight_type = 'direct'
        flights.append({
            "first_flight":flight,
            "total_duration":flight_duration
        })

    return flights



def get_layovers_flights(
    flights_query,
    departure_airport,
    arrival_airport
):

    journeys = []

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

                
    return journeys



def search_flights(
        flights_query, 
        departure_airport,
        arrival_airport,
        layovers
    ):
    
    direct_route = Route.query.filter_by(
            departure_airport_id=departure_airport.id,
            arrival_airport_id=arrival_airport.id
        ).first()

    journeys = []
    if direct_route:
        journeys.extend(get_direct_flights(
            flights_query=flights_query,
            route=direct_route
        ))

    if(layovers):
        journeys.extend(get_layovers_flights(
            flights_query=flights_query,
            departure_airport=departure_airport,
            arrival_airport=arrival_airport
        ))

    return journeys

# endpoint per ottenere i posi liberi di un determinato volo
@flights_bp.route('/flights/free_seats', methods=['GET'])
def get_free_seats():
    try:
        flight_id = request.args.get('flight_id', type=int)
        seats = Seat.query.filter_by(flight_id=flight_id, state=SeatState.AVAILABLE).all()
        return seats_schema.dump(seats)
    except Exception as e:
        print(f"Error fetching free seats for flight {flight_id}: {e}")
        return []
    

@flights_bp.route('/flights/<int:flight_id>/free_seats', methods=['GET'])
def get_seats(flight_id):
    try:
        seats = get_seats_flight(flight_id=flight_id)
        return jsonify({
                "message":"Seats retrieved successfully", 
                "seats": 
                seats_schema.dump(seats)
            }), 200
    except Exception as e:
        print(f"Error fetching seats for flight {flight_id}: {e}")
        return jsonify({
                "message":"Internal error retrieving seats", 
            }), 500