import traceback
from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Flight, Route, Airport, Aircraft, AircraftClass, Seat, SeatState, UserRole, Aircraft, AirlineRoute
from schema import flights_schema, flight_schema, journeys_schema, seats_schema
from datetime import datetime
from sqlalchemy import and_, func, desc, or_

from sqlalchemy import func, desc, or_
from middleware.auth import roles_required
from flask_jwt_extended import get_jwt_identity

flights_bp = Blueprint('flight', __name__)

@flights_bp.route('/flights', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_flight():
    """
    Creates a new flight for the authenticated airline, along with its seats.

    This endpoint is protected and only accessible by users with the AIRLINE role. It accepts
    flight details, calculates seat assignments, and stores both flight and seat data in the database.

    Request JSON parameters:
        - route_id (int, required): The ID of the route for the flight.
        - aircraft_id (int, required): The ID of the aircraft assigned to the flight.
        - departure_time (str, required): Flight departure time in "%Y-%m-%d %H:%M" format.
        - arrival_time (str, required): Flight arrival time in "%Y-%m-%d %H:%M" format.
        - base_price (float, required): Base ticket price for the flight.

    Responses:
        - 201 Created: Flight and seats successfully created.
            {
                "message": "Flight created successfully"
            }
        - 500 Internal Server Error: Unexpected error during flight creation.
            {
                "message": "Error creating flight"
            }

    Notes:
        - Seat letters increment from 'A' to 'F', then a new row number is added.
        - Exceptions are logged and the session is rolled back on error.
        - Flight duration is stored in seconds for convenience.
    """
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
    """
    Retrieve available flights based on search filters (one-way).

    This endpoint allows users to search for flights between a departure and 
    arrival airport, optionally including layovers, date, price, and sorting options.
    It supports pagination and sorting by price, duration, departure time, or arrival time.

    Query Parameters:
        sort_by (str, optional): Sorting field ('price', 'duration', 'departure_time', 'arrival_time') (default: 'total_duration')
        order (str, optional): Sorting order ('asc' or 'desc') (default: 'asc')
        from (str, required): Departure airport code or city name
        to (str, required): Arrival airport code or city name
        departure_date (str, required): Date of departure in 'YYYY-MM-DD' format
        max_layovers (int, optional): Maximum number of layovers allowed (default: 1)
        max_price (int, optional): Maximum total price (default: 2000)

    Returns:
        JSON response:
            - 200 OK: Flights found and returned with pagination info
            - 400 Bad Request: Missing required parameters
            - 404 Not Found: No matching airports or flights
            - 500 Internal Server Error: Unexpected server error
    """
    try:
        page_number = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        sort_by = request.args.get('sort_by', 'total_duration')
        order = request.args.get('order', 'asc').lower()
        departure_airport_code = request.args.get('from')
        arrival_airport_code = request.args.get('to')
        layovers = request.args.get('max_layovers', 1, type=int)
        departure_date = request.args.get('departure_date')

        max_price = request.args.get('max_price', 2000, type=int)
        # round_trip = request.args.get('round_trip', 0, type=int)
        # arrival_date = request.args.get('arrival_date')

        sort = {'sort_by' : sort_by, 'order' : order}

        if not departure_airport_code or not arrival_airport_code:
            return jsonify({
                'message': 'Both departure and arrival airport codes are required'
            }), 400


        departure_airports = Airport.query.filter(
            or_(
                Airport.code.ilike(departure_airport_code),
                Airport.city.ilike(departure_airport_code)
            )
        ).all()
        if len(departure_airports) == 0:
            return jsonify({"message":"Departure airport not found"}), 404

        arrival_airports = Airport.query.filter(
            or_(
                Airport.code.ilike(arrival_airport_code),
                Airport.city.ilike(arrival_airport_code)
            )
        ).all()
        if len(arrival_airports) == 0:
            return jsonify({"message":"Arrival airport not found"}), 404
        
        flights_query = Flight.query 

        if not departure_date:
            return jsonify({"message":"Departure date required"}), 404
        formatted_departure_date = datetime.strptime(departure_date, "%Y-%m-%d")
        flights_query = flights_query.where(func.date(Flight.departure_time) == formatted_departure_date.date())

        journeys = search_flights(
            flights_query=flights_query,
            departure_airports=departure_airports,
            arrival_airports=arrival_airports,
            layovers=layovers,
            max_price=max_price
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
        
    
    

@flights_bp.route('/airline/flights', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_airline_flights():
    """
    Retrieve all active flights associated with the logged-in airline.

    This endpoint allows airline users to fetch all flights operated by their airline.
    Only flights where the aircraft is active and the airline route is active are returned.

    Returns:
        JSON response:
            - 200 OK: Flights retrieved successfully (may return an empty list if none found)
                {
                    "message": "Flights retrieved successfully",
                    "flights": [...]
                }
            - 500 Internal Server Error: If an unexpected error occurs during the query

    Permissions:
        - Role: AIRLINE
    """

    try:
        airline_id = get_jwt_identity()
        from models import AirlineRoute

        flights = db.session.query(Flight).join(Aircraft, Flight.aircraft_id == Aircraft.id).join(Route, Flight.route_id == Route.id).join(
            AirlineRoute, (AirlineRoute.route_id == Route.id) & (AirlineRoute.airline_id == airline_id)
        ).filter(
            Aircraft.airline_id == airline_id,
            Aircraft.active == True,
            AirlineRoute.active == True
        ).all()

        if not flights:
            return jsonify({"message": "Flights retrieved successfully", "flights": []}), 200

        return jsonify({"message": "Flights retrieved successfully", "flights": flights_schema.dump(flights)}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving airline flights"}), 500
    


@flights_bp.route('/flights/count-all', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_flights_count_all():
    """
    Retrieve the total number of active flights in the system.

    This endpoint is accessible only by users with the **ADMIN** role.
    It counts all flights that are currently marked as active in the database.

    Returns:
        JSON response:
            - 200 OK: Successfully retrieved total flight count
                {
                    "message": "Total flights count retrieved",
                    "count": 123
                }
            - 500 Internal Server Error: If an error occurs during the query

    Permissions:
        - Role: ADMIN
    """
    try:
        count = Flight.query.filter_by(active=True).count()
        return jsonify({"message": "Total flights count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving total flights count"}), 500
    


@flights_bp.route('/flights/routes-count-all', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_routes_count_all():
    """
    Retrieve the total number of active airline routes in the system.

    This endpoint counts all distinct routes that are currently active 
    for at least one airline. Only users with the ADMIN role can access it.

    Returns:
        JSON response:
            - 200 OK: Successfully retrieved total routes count
                {
                    "message": "Total routes count retrieved",
                    "count": 42
                }
            - 500 Internal Server Error: If an error occurs during the query

    Permissions:
        - Role: ADMIN
    """
    try:
        count = (
            db.session.query(Route)
            .join(AirlineRoute, AirlineRoute.route_id == Route.id)
            .filter(AirlineRoute.active == True)
            .distinct(Route.id)
            .count()
        )
        return jsonify({"message": "Total routes count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving total routes count"}), 500
    

@flights_bp.route('/flights/<int:flight_id>', methods=['GET'])
@roles_required([UserRole.AIRLINE.value, UserRole.PASSENGER.value])
def get_flight_by_id(flight_id):  
    """
    Retrieve detailed information about a specific flight by its ID.

    This endpoint is accessible to both airline and passenger users.  
    It fetches a flight from the database using its unique identifier and 
    returns the serialized flight data if found.

    Args:
        flight_id (int): The unique identifier of the flight to retrieve, 
                         passed as a URL path parameter.

    Returns:
        Response (JSON): 
            - 200 OK: Flight found and returned successfully.
            - 400 Bad Request: Flight ID not provided.
            - 404 Not Found: No flight found with the given ID.
            - 500 Internal Server Error: Unexpected server error.
    """
    try:
        if not flight_id:
            return jsonify({
                'message': 'flight id missing'
            }), 400
        
        flight = Flight.query.filter_by(id=flight_id).first()

        if not flight:
            return jsonify({
                    "message": "Flight not found"
                }), 404
        
        return jsonify({
                "message":"Flight retrieved successfully", 
                "flight": 
                flight_schema.dump(flight)
            }), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving flight"}), 500



def sort_journeys(journeys, sort_params):
    """
    Sorts a list of flight journeys based on user-defined criteria.

    Each journey is represented as a dictionary containing one or two flights 
    (for direct or layover journeys), as well as calculated fields such as 
    total price and total duration. The sorting is applied in-place.

    Args:
        journeys (list[dict]): 
            A list of journeys, where each journey is a dictionary that must include:
                - "first_flight" (Flight): The first flight object.
                - "second_flight" (Flight, optional): The second flight (for layovers).
                - "total_price" (float | Decimal): Combined journey cost.
                - "total_duration" (float): Journey duration in hours.
        sort_params (dict): 
            A dictionary specifying sorting options. Must contain:
                - "sort_by" (str): Field to sort by. Supported values:
                    - "departure_time"
                    - "arrival_time"
                    - "price"
                    - "duration"
                - "order" (str): Sorting order. Supported values:
                    - "asc" for ascending
                    - "desc" for descending

    Returns:
        None: The `journeys` list is sorted in-place.
    """

    if(sort_params['order'] == "asc"):

        if(sort_params["sort_by"]=="departure_time"):
            journeys.sort(key=lambda x: x["first_flight"].departure_time)
        elif(sort_params["sort_by"]=="arrival_time"):
            journeys.sort(key=lambda x: x['second_flight'].arrival_time if x.get('second_flight') else x['first_flight'].arrival_time)
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
    """
    Retrieves all seats for a specific flight.

    This function queries the database to fetch all seats associated
    with the given flight ID, ordered by their ID. It returns a list
    of `Seat` objects if successful, or `None` in case of an error.

    Args:
        flight_id (int): The unique identifier of the flight.

    Returns:
        list[Seat] | None:
            - A list of `Seat` objects belonging to the specified flight, ordered by seat ID.
            - `None` if an error occurs during the query.
    """
    try:
        seats = Seat.query.filter_by(flight_id=flight_id).order_by(Seat.id).all()
        return seats

    except Exception as e:
        print(e)
        return None


def get_direct_flights(
        flights_query,
        routes,
        max_price
):
    """
    Retrieves all direct flights matching the given routes and price constraints.

    This function filters available flights that are part of the specified routes and whose 
    base price is below the given maximum price. It returns a list of journey dictionaries 
    containing flight details, total duration, and total cost.

    Args:
        flights_query (BaseQuery):
            A SQLAlchemy query object for filtering flights (e.g., already filtered by date or airline).
        routes (list[Route]):
            A list of `Route` objects representing valid departure-arrival airport pairs.
        max_price (float | Decimal):
            The maximum allowed base price for a flight.

    Returns:
        list[dict]:
            A list of journey dictionaries. Each dictionary contains:
                - "first_flight": The `Flight` object representing the direct flight.
                - "total_duration": Duration of the flight in hours (int).
                - "total_price": The base price of the flight (float or Decimal).
    """

    flights = []
    route_ids = [r.id for r in routes]

    direct_flights = flights_query.filter(
        and_(
            Flight.route_id.in_(route_ids), 
            Flight.base_price < max_price
        )
    ).all()
    for flight in direct_flights:
        flight_duration = (flight.arrival_time - flight.departure_time).total_seconds() // 3600
        flights.append({
            "first_flight":flight,
            "total_duration":flight_duration,
            "total_price": flight.base_price
        })

    return flights



def get_layovers_flights(
    flights_query,
    departure_airports,
    arrival_airports,
    max_price
):
    """
    Finds all valid two-leg journeys (with one layover) that match given criteria.

    This function identifies possible connecting flights (with exactly one layover)
    between a list of departure airports and arrival airports, within a specified 
    maximum price and acceptable layover time range.

    Args:
        flights_query (BaseQuery):
            SQLAlchemy query object to filter flights (e.g., pre-filtered by date or airline).
        departure_airports (list[Airport]):
            List of `Airport` objects representing allowed departure airports.
        arrival_airports (list[Airport]):
            List of `Airport` objects representing allowed final destination airports.
        max_price (float | Decimal):
            Maximum total allowed price for the combined journey.

    Returns:
        list[dict]:
            A list of dictionaries representing valid layover journeys. Each dictionary includes:
                - "first_flight": The first `Flight` object.
                - "second_flight": The second `Flight` object.
                - "total_duration": Total journey duration in hours (int).
                - "total_price": Total combined price of both flights.

    Notes:
        - Only considers **2-leg journeys** (exactly one layover).
        - The layover time must be **between 2 and 12 hours**.
        - Both flights must be available and meet price constraints.
        - Returns an empty list if no valid layover combinations are found.
    """

    journeys = []

    min_connection_seconds = 2 * 3600
    max_connection_seconds = 12 * 3600

    departure_airports_id = [dep.id for dep in departure_airports]
    arrival_airports_id = [arr.id for arr in arrival_airports]

    departure_routes = Route.query.where(
        (Route.departure_airport_id.in_(departure_airports_id)) &
        (Route.arrival_airport_id.not_in(arrival_airports_id))).all()

    arrival_routes = Route.query.where(
        (Route.arrival_airport_id.in_(arrival_airports_id)) &
        (Route.departure_airport_id.not_in(departure_airports_id))).all()

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
                            total_journey_price = first_flight.base_price + second_flight.base_price

                            if total_journey_price <= max_price:

                                journeys.append({
                                    "first_flight":first_flight, 
                                    "second_flight":second_flight,
                                    "total_duration":total_journey_duration,
                                    "total_price": total_journey_price
                                })

                
    return journeys



def search_flights(
        flights_query, 
        departure_airports,
        arrival_airports,
        layovers,
        max_price
    ):
    """
    Searches for available flight journeys (direct and with layovers) based on given parameters.

    This function constructs and returns a list of possible flight journeys matching the 
    departure and arrival airports, considering optional layovers and a maximum price constraint.

    Args:
        flights_query (BaseQuery):
            A SQLAlchemy query object used to filter flights (e.g., by date, airline, etc.).
        departure_airports (list[Airport]):
            A list of `Airport` objects representing possible departure airports.
        arrival_airports (list[Airport]):
            A list of `Airport` objects representing possible arrival airports.
        layovers (bool):
            Whether to include flight combinations with layovers in the search.
        max_price (float | Decimal | None):
            The maximum allowed total price for the journey. If `None`, no price filter is applied.

    Returns:
        list[dict]:
            A list of journey objects (typically dictionaries) representing matching flights.
            Each journey can be either:
                - A direct flight (via `get_direct_flights`), or
                - A multi-leg journey with one or more layovers (via `get_layovers_flights`).

    Notes:
        - Returns an empty list if no matching routes or flights are found.
        - Does not commit any database transaction; purely a query operation.
    """
    
    direct_routes = []

    for dep_airport in departure_airports:
        for arr_airport in arrival_airports:
            direct_routes.extend(Route.query.filter_by(
                    departure_airport_id=dep_airport.id,
                    arrival_airport_id=arr_airport.id,
                ).all())

    journeys = []
    if len(direct_routes) > 0:
        journeys.extend(get_direct_flights(
            flights_query=flights_query,
            routes=direct_routes,
            max_price=max_price
        ))

    if(layovers):
        journeys.extend(get_layovers_flights(
            flights_query=flights_query,
            departure_airports=departure_airports,
            arrival_airports=arrival_airports,
            max_price=max_price
        ))

    return journeys
    

@flights_bp.route('/flights/<int:flight_id>/seats', methods=['GET'])
def get_seats(flight_id):
    """
    Retrieves all seats for a specific flight.

    This endpoint fetches all seats associated with the given flight ID and returns them
    in a serialized format. It does not require authentication.

    URL Parameters:
        - flight_id (int): The ID of the flight for which to retrieve seats.

    Responses:
        - 200 OK: Seats successfully retrieved.
            {
                "message": "Seats retrieved successfully",
                "seats": [<serialized_seat_data>, ...]
            }
        - 500 Internal Server Error: Unexpected error while retrieving seats.
            {
                "message": "Internal error retrieving seats"
            }
    """
    try:
        seats = get_seats_flight(flight_id=flight_id)
        print(seats)
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