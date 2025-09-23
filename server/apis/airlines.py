from datetime import datetime
from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Airline, Route, Airport, AirlineRoute, UserRole, Extra, User
from flask_restful import Resource
from schema import route_schema, routes_schema, airline_schema, airlines_schema, extras_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from sqlalchemy.orm import joinedload
from middleware.auth import roles_required

airlines_bp = Blueprint('airline', __name__)


@airlines_bp.route('/airlines/me', methods=['GET'])
@jwt_required()
@roles_required([UserRole.AIRLINE.value])
def get_my_airline():
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
    


@airlines_bp.route('/routes/count', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_routes_count():
    try:
        count = Route.query.count()
        return jsonify({"message": "Routes count retrieved", "count": count}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving routes count"}), 500
    

@airlines_bp.route('/routes', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_route():
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
    try:
        airline_id = get_jwt_identity()
        existing_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=route_id).first()
        if not existing_route:
            return jsonify({
                    "message": "Route not found"
                }), 404
        
        existing_route.active = False
        # existing_route.deletion_time = datetime.now()
        db.session.commit()
        
        return jsonify({
                "message":"Route deleted successfully"
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error deleting route"
            }), 500
    


# Extras 


@airlines_bp.route('/extras', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_extra():
    try:
        airline_id = get_jwt_identity()
        data = request.get_json()

        name = data["name"]
        price = data["price"]

        if(not name or not price):
            return jsonify({"message:" "Missing required fields for creating extra"}), 409
        
        new_extra = Extra(
            name=name,
            price=price,
            airline_id=airline_id
        )

        db.session.add(new_extra)
        db.session.commit()

        return jsonify({"message":"Extra created successfully"}), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error creating extra"}), 500


@airlines_bp.route('/extras', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_extras():  
    try:
        airline_id = get_jwt_identity()
        if not airline_id:
            return jsonify({"message": "Missing airline_id"}), 400
        
        extras = Extra.query.filter_by(airline_id = airline_id).all()
        if not extras:
            return jsonify({
                    "message": "No extras found"
                }), 404
        
        return jsonify({
                "message":"Extras retrieved successfully", 
                "extras": extras_schema.dump(extras)
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error retrieving extras"
            }), 500
    

@airlines_bp.route('/extras/<int:extra_id>', methods=['DELETE'])
@roles_required([UserRole.AIRLINE.value])
def delete_extras(extra_id):  
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