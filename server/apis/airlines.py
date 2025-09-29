
from flask import jsonify, request, Blueprint
from datetime import datetime

from sqlalchemy import distinct, func
from app.extensions import db, cache
from models import Airline, Route, Airport, AirlineRoute, UserRole, Extra, Passenger, Ticket, Aircraft, Flight
from flask_restful import Resource
from schema import route_schema, routes_schema, airline_schema, airlines_schema, extras_schema, airline_dashboard_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from sqlalchemy.orm import joinedload
from middleware.auth import roles_required

airlines_bp = Blueprint('airline', __name__)


@airlines_bp.route('/airlines/me', methods=['GET'])
@jwt_required()
@roles_required([UserRole.AIRLINE.value])
def get_my_airline():
    """
    Retrieves the profile information of the authenticated airline.

    This endpoint is protected and only accessible by users with the AIRLINE role. It fetches
    the airline record associated with the JWT identity.

    Responses:
        - 200 OK: Airline successfully retrieved.
            <Serialized airline JSON data>
        - 404 Not Found: Airline record does not exist.
            {
                "message": "Airline not found"
            }
        - 500 Internal Server Error: Unexpected error while retrieving airline data.
            {
                "message": "Error retrieving airline info"
            }

    Notes:
        - Requires a valid JWT and the AIRLINE role.
    """
    try:
        user_id = get_jwt_identity()
        airline = Airline.query.filter_by(id=user_id).first()
        if not airline:
            return jsonify({
                    'message': 'Airline not found'
                }), 404
        return jsonify(airline_schema.dump(airline)), 200
    except Exception as e:
        print(e)
        return jsonify({
                'message': 'Error retrieving airline info'
            }), 500

# Routes 

@airlines_bp.route('/routes', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_routes():
    """
    Retrieves all active routes associated with the authenticated airline.

    This endpoint is protected and only accessible by users with the AIRLINE role. It fetches
    all routes linked to the airline through the AirlineRoute association and returns them in JSON format.

    Responses:
        - 200 OK: Routes successfully retrieved.
            {
                "message": "Routes retrieved successfully",
                "routes": [<serialized_route_data>]
            }
        - 500 Internal Server Error: Unexpected error while retrieving routes.
            {
                "message": "Error retrieving routes"
            }
    """
    try:
        user_id = get_jwt_identity()
        routes = Route.query.outerjoin(AirlineRoute).filter_by(airline_id=user_id, active=True).all()

        return jsonify({
                "message":"Routes retrieved successfully", 
                "routes": routes_schema.dump(routes)
            }), 200

    except Exception as e:
        print(e)
        return jsonify({
                "message":"Error retrieving routes"
            }), 500
    


@airlines_bp.route('/airlines', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_all_airlines():
    """
    Retrieves all airlines in the system.

    This endpoint is protected and only accessible by users with the ADMIN role. It returns
    a list of all airlines stored in the database.

    Responses:
        - 200 OK: Airlines successfully retrieved.
            {
                "message": "Airlines retrieved successfully",
                "airlines": [<serialized_airline_data>]
            }
        - 500 Internal Server Error: Unexpected error while retrieving airlines.
            {
                "message": "Error retrieving airlines"
            }
    """
    try:
        airlines = Airline.query.all()
        return jsonify({"message": "Airlines retrieved successfully", "airlines": airlines_schema.dump(airlines)}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving airlines"}), 500
    


@airlines_bp.route('/airlines/count', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_airlines_count():
    try:
        count = Airline.query.count()
        return jsonify({"message": "Airlines count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving airlines count"}), 500
    
    

@airlines_bp.route('/routes', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_route():
    """
    Creates a new route for the authenticated airline or reactivates an existing one.

    This endpoint is protected and only accessible by users with the AIRLINE role. It creates
    a new route between two airports if it does not exist, associates it with the airline,
    or reactivates the route if it was previously deactivated.

    Request JSON parameters:
        - departure_airport_code (str): IATA code of the departure airport.
        - arrival_airport_code (str): IATA code of the arrival airport.

    Responses:
        - 201 Created: Route successfully created or reactivated.
            {
                "message": "Route created successfully",
                "routes": <serialized_route_data>
            }
        - 409 Conflict: Departure airport does not exist or route already registered.
            {
                "message": "Airport not exists" / "Route already registered"
            }
        - 500 Internal Server Error: Unexpected error during route creation.
            {
                "message": "Internal error creating routes"
            }
    """
    try:
        airline_id = get_jwt_identity()
        data = request.get_json()

        departure_airport_code = data['departure_airport_code']
        arrival_airport_code = data['arrival_airport_code']

        departure_airport = Airport.query.filter_by(code=departure_airport_code).first()
        if(not departure_airport):
            return jsonify({
                    "message": "Airport not exists"
                }), 409
        departure_airport_id = departure_airport.id
        arrival_airport_id = Airport.query.filter_by(code=arrival_airport_code).first().id

        existing_route = Route.query.filter_by(departure_airport_id=departure_airport_id, arrival_airport_id=arrival_airport_id).first()


        if not existing_route:
            new_route = Route(
                departure_airport_id=departure_airport_id,
                arrival_airport_id=arrival_airport_id,
            )

            db.session.add(new_route)
            db.session.flush()

            existing_route = new_route


        existing_airline_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=existing_route.id).first()

        if existing_airline_route:
            if not existing_airline_route.active:
                existing_airline_route.active = True
            else:
                return jsonify({
                        "message": "Route already registered"
                    }), 409
        
        else:
            new_airline_route = AirlineRoute(
                airline_id=airline_id,
                route_id=existing_route.id
            )
            
            db.session.add(new_airline_route)
        
        db.session.commit()
        cache.delete(f'airline_routes_count_{airline_id}')

        return jsonify({
                'message': 'Route created successfully', 
                "routes": route_schema.dump(existing_route)
            }), 201

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
                "message":"Internal error creating routes"
            }), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_route_by_id(route_id): 
    """
    Retrieves a specific route for the authenticated airline by its ID.

    This endpoint is protected and only accessible by users with the AIRLINE role. It ensures
    that the requested route is associated with the authenticated airline before returning it.

    URL Parameters:
        - route_id (int): The ID of the route to retrieve.

    Responses:
        - 200 OK: Route successfully retrieved.
            {
                "message": "Route retrieved successfully",
                "route": <serialized_route_data>
            }
        - 404 Not Found: Route does not exist or is not associated with the airline.
            {
                "message": "Route not found"
            }
        - 500 Internal Server Error: Unexpected error while retrieving the route.
            {
                "message": "Internal error retrieving route"
            }
    """ 
    try:
        airline_id = get_jwt_identity()
        existing_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=route_id).first()
        if not existing_route:
            return jsonify({
                    "message": "Route not found"
                }), 404
        
        route = Route.query.filter_by(id=route_id).first()
        
        return jsonify({
                "message":"Route retrieved successfully", 
                "route": route_schema.dump(route)
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error retrieving route"
            }), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['DELETE'])
@roles_required([UserRole.AIRLINE.value])
def delete_route_by_id(route_id): 
    """
    Soft-deletes a specific route for the authenticated airline by marking it as inactive.

    This endpoint is protected and only accessible by users with the AIRLINE role. It ensures
    that the route belongs to the authenticated airline before performing a soft delete.

    URL Parameters:
        - route_id (int): The ID of the route to delete.

    Responses:
        - 200 OK: Route successfully soft-deleted.
            {
                "message": "Route deleted successfully"
            }
        - 404 Not Found: Route does not exist or is not associated with the airline.
            {
                "message": "Route not found"
            }
        - 500 Internal Server Error: Unexpected error during route deletion.
            {
                "message": "Internal error deleting route"
            }
    """ 
    try:
        airline_id = get_jwt_identity()
        existing_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=route_id).first()
        if not existing_route:
            return jsonify({
                    "message": "Route not found"
                }), 404
        
        existing_route.active = False
        existing_route.deletion_time = datetime.now()
        db.session.commit()
        cache.delete(f'airline_routes_count_{airline_id}')
        
        return jsonify({
                "message":"Route deleted successfully"
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error deleting route"
            }), 500
    


# Extras 



@airlines_bp.route('airlines/extras', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_extra():
    """
    Create a new extra service for the logged-in airline.

    This endpoint allows an airline user to add a new extra service,
    specifying its name and price. The extra is marked as active upon creation.

    Args (JSON body):
        name (str): Name of the extra service.
        price (float): Price of the extra service.

    Returns:
        JSON response:
            - 200: Extra created successfully.
            - 409: Missing required fields.
            - 500: Internal server error.
    """
    try:
        airline_id = get_jwt_identity()
        data = request.get_json()


        name = data.get("name")
        price = data.get("price")

        if not name or price is None:
            return jsonify({"message": "Missing required fields for creating extra"}), 409


        new_extra = Extra(
            name=name,
            price=price,
            airline_id=airline_id,
            active=True,
            deletion_time=None
        )

        db.session.add(new_extra)
        db.session.commit()

        return jsonify({"message": "Extra created successfully"}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error creating extra"}), 500


@airlines_bp.route('airlines/extras', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_extras():  
    try:
        airline_id = get_jwt_identity()
        extras = Extra.query.filter_by(airline_id=airline_id, active=True).all()
        return jsonify({
            "message": "Extras retrieved successfully",
            "extras": extras_schema.dump(extras)
        }), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal error retrieving extras"}), 500
    
    

@airlines_bp.route('/airline/<int:airline_id>/extra', methods=['GET'])
def get_extras_t(airline_id): 
    """
    Retrieve all extra services for a specific airline.

    This endpoint returns a list of extras associated with the given airline.
    Extras are serialized using the `extras_schema`.

    Args:
        airline_id (int): The ID of the airline.

    Returns:
        JSON response:
            - 200: Extras retrieved successfully.
            - 400: Missing airline_id.
            - 500: Internal server error.
    """ 
    try:
        airline_id = airline_id
        if not airline_id:
            return jsonify({"message": "Missing airline_id"}), 400
        
        extras = Extra.query.filter_by(airline_id = airline_id, active = True).all()
        
        return jsonify({
                "message":"Extras retrieved successfully", 
                "extras": extras_schema.dump(extras)
            }), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal error retrieving extras"}), 500
    

@airlines_bp.route('/airlines/extras/<int:extra_id>', methods=['DELETE'])
@roles_required([UserRole.AIRLINE.value])
def delete_extra(extra_id):
    try:
        airline_id = get_jwt_identity()
        extra = Extra.query.filter_by(id=extra_id, airline_id=airline_id, active=True).first()
        if not extra:
            return jsonify({"message": "Extra not found"}), 404
        extra.active = False
        extra.deletion_time = datetime.now()
        db.session.commit()
        return jsonify({"message": "Extra deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
                "message": "Internal error deleting extras"
            }), 500
    

@airlines_bp.route('/extras/<int:extra_id>', methods=['DELETE'])
@roles_required([UserRole.AIRLINE.value])
def delete_extras(extra_id):  
    """
    Soft-delete an extra service offered by an airline.

    This endpoint sets the 'active' field of the specified extra to False
    and records the deletion time. Only the airline that owns the extra
    can delete it. Requires the user to have the AIRLINE role.

    Args:
        extra_id (int): The ID of the extra service to be deleted.

    Returns:
        JSON response:
            - 200: Extra deleted successfully.
            - 400: Missing airline_id in JWT.
            - 404: Extra not found for this airline.
            - 500: Internal server error.
    """
    try:
        airline_id = get_jwt_identity()
        if not airline_id:
            return jsonify({"message": "Missing airline_id"}), 400
        
        extra = Extra.query.filter_by(airline_id = airline_id, id=extra_id).all()
        if not extra:
            return jsonify({
                    "message": "No extra found"
                }), 404
        
        extra.active = False
        extra.deletion_time = datetime.now()
        db.session.commit()
        
        return jsonify({
                "message":"Extra deleted successfully", 
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error deleting extras"
            }), 500
    


def get_airlines_passengers_count(airline_id):
    """
    Retrieve the total number of distinct passengers for a specific airline.

    This function counts all unique passengers who have purchased tickets
    for flights operated by the given airline. The result is cached for
    60 seconds to reduce database load.

    Args:
        airline_id (int): The ID of the airline.

    Returns:
        int: Total number of distinct passengers for the airline.
    """
    try:
        cache_key = f'airline_passenger_count_{airline_id}'
        passenger_count = cache.get(cache_key)
        if passenger_count is None:
            passenger_count = (
                db.session.query(Passenger.id)
                .join(Ticket, Ticket.passenger_id == Passenger.id)
                .join(Flight, Ticket.flight_id == Flight.id)
                .join(Aircraft, Flight.aircraft_id == Aircraft.id)
                .filter(Aircraft.airline_id == airline_id)
                .distinct()
                .count()
            )

            cache.set(cache_key, passenger_count, timeout=60)

        return passenger_count
    except Exception as e:
        raise e


def get_airlines_monthly_income(airline_id):
    """
    Retrieve the total income for a specific airline for the current month.

    This function sums the `final_cost` of all tickets associated with flights
    of the given airline that were purchased within the current month.
    The result is cached for 60 seconds to reduce database load.

    Args:
        airline_id (int): The ID of the airline.

    Returns:
        float or None: Total income for the airline in the current month.
                       Returns None if there are no ticket sales.
    """
    try:
        cache_key = f'airline_monthly_income_{airline_id}'
        monthly_income = cache.get(cache_key)
        if monthly_income is None:
            start_date = datetime(datetime.now().year, datetime.now().month, 1)
            end_date = datetime(datetime.now().year, datetime.now().month + 1, 1)

            monthly_income = (
                db.session.query(func.sum(Ticket.final_cost))
                .join(Flight, Ticket.flight_id == Flight.id)
                .join(Aircraft, Flight.aircraft_id == Aircraft.id)
                .filter(Aircraft.airline_id == airline_id)
                .filter(Ticket.purchase_date >= start_date, Ticket.purchase_date <= end_date)
                .scalar()
            )

            cache.set(cache_key, monthly_income, timeout=60)
        
        return monthly_income
    except Exception as e:
        raise e


def get_airlines_routes_count(airline_id):
    """
    Retrieve the total number of distinct routes for a specific airline.

    This function counts all unique routes associated with the given airline.
    The result is cached for 1 hour (3600 seconds) to reduce database load.

    Args:
        airline_id (int): The ID of the airline.

    Returns:
        int: The number of distinct routes for the airline.

    Raises:
        Exception: Propagates any exception that occurs during the database query.
    """
    try:
        cache_key = f'airline_routes_count_{airline_id}'
        routes_count = cache.get(cache_key)
        if routes_count is None:
            routes_count = (
                db.session.query(AirlineRoute.route_id)
                .filter(AirlineRoute.airline_id == airline_id)
                .distinct()
                .count()
            )

            cache.set(cache_key, routes_count, timeout=3600)

        return routes_count
    except Exception as e:
        raise


def get_airlines_flights_in_progress(airline_id):
    """
    Retrieve the number of flights currently in progress for a given airline.

    A flight is considered "in progress" if the current time is between
    its departure_time and arrival_time. The result is cached for 60 seconds
    to reduce database load.

    Args:
        airline_id (int): The ID of the airline.

    Returns:
        int: The count of flights currently in progress for the airline.
    """
    try:
        cache_key = f'airline_flights_in_progress_{airline_id}'
        fligths_in_progress_count = cache.get(cache_key)
        if fligths_in_progress_count is None:
            fligths_in_progress_count = (
                db.session.query(Flight.id)
                .join(Aircraft, Flight.aircraft_id == Aircraft.id)
                .filter(Aircraft.airline_id == airline_id, Flight.departure_time <= datetime.now(), Flight.arrival_time >= datetime.now())
                .distinct()
                .count()
            )

            cache.set(cache_key, fligths_in_progress_count, timeout=60)

        return fligths_in_progress_count
    except Exception as e:
        raise


@airlines_bp.route('/airlines/dashboard-stats', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_dashboard_stats():
    """
    Retrieve dashboard statistics for the logged-in airline.

    This endpoint returns key metrics for the airline's dashboard, including:
        - Total number of passengers
        - Monthly income
        - Number of active routes
        - Number of flights currently in progress

    Returns:
        JSON response:
            - 200 OK: Successfully retrieved dashboard stats
                {
                    "message": "Dashboard stats retrieved successfully",
                    "stats": {
                        "passenger_count": 1200,
                        "monthly_income": 450000.50,
                        "active_routes": 32,
                        "flights_in_progress": 5
                    }
                }
            - 400 Bad Request: If airline_id is missing
            - 500 Internal Server Error: If an unexpected error occurs during retrieval

    Permissions:
        - Role: AIRLINE
    """
    try:
        airline_id = get_jwt_identity()
        if not airline_id:
            return jsonify({"message": "Missing airline_id"}), 400
        
        passenger_count = get_airlines_passengers_count(airline_id=airline_id)
        monthly_income = get_airlines_monthly_income(airline_id=airline_id)
        active_routes = get_airlines_routes_count(airline_id=airline_id)
        flights_in_progress = get_airlines_flights_in_progress(airline_id=airline_id)

        dashboard = {
                'passenger_count' : passenger_count,
                'monthly_income': monthly_income,
                'active_routes': active_routes,
                'flights_in_progress': flights_in_progress
            }
        
        return jsonify({
                "message":"Dashboard stats retrieved successfully",
                "stats": airline_dashboard_schema.dump(dashboard)
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error deleting extras"
            }), 500
    



@airlines_bp.route('/routes/count', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_routes_count():
    """
    Retrieve the total number of active airline routes with caching.

    This endpoint counts all distinct routes currently active for any airline.
    The result is cached for 60 seconds to reduce database load.

    Returns:
        JSON response:
            - 200 OK: Successfully retrieved active routes count
                {
                    "message": "Routes count retrieved",
                    "count": 42
                }
            - 500 Internal Server Error: If an unexpected error occurs during the query

    Permissions:
        - Role: ADMIN
    """
    try:
        count = cache.get('total_active_routes')
        if count is None:
            count = AirlineRoute.query \
                .with_entities(func.count(distinct(AirlineRoute.route_id))) \
                .filter(AirlineRoute.active == True) \
                .scalar()
            cache.set('total_active_routes', count, timeout=60)
        return jsonify({
            "message": "Routes count retrieved", 
            "count": count
        }), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving routes count"}), 500