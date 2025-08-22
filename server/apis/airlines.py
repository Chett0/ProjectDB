from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Airline, Route, Airport, AirlineRoute, UserRole
from flask_restful import Resource
from schema import route_schema, routes_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from sqlalchemy.orm import joinedload
from middleware.auth import roles_required

airlines_bp = Blueprint('airline', __name__)

# Routes 

@airlines_bp.route('/routes', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_routes():
    try:
        user_id = get_jwt_identity()
        routes = Route.query.outerjoin(AirlineRoute).filter_by(airline_id=user_id).all()

        return jsonify({"message":"Routes retrieved successfully", "routes": routes_schema.dump(routes)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving routes"}), 500
    

@airlines_bp.route('/routes', methods=['POST'])
def create_route():
    #airline_code from jwt token
    airline_id = 2
    try:
        data = request.get_json()

        departure_airport_code = data['departure_airport_code']
        arrival_airport_code = data['arrival_airport_code']

        departure_airport_id = Airport.query.filter_by(code=departure_airport_code).first().id
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
            return jsonify({"message": "Route already registered"}), 409
        
        new_airline_route = AirlineRoute(
            airline_id=airline_id,
            route_id=existing_route.id
        )
        
        db.session.add(new_airline_route)
        db.session.commit()

        return jsonify({'message': 'Route created successfully'}), 201

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving routes"}), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['GET'])
def get_route_by_id(route_id):  
    airline_id = 1
    try:
        existing_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=route_id).first()
        if not existing_route:
            return jsonify({"message": "Route not found"}), 404
        
        route = Route.query.filter_by(id=route_id).first()
        
        return jsonify({"message":"Route deleted successfully", "route": route_schema.dump(route)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving route"}), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['DELETE'])
def delete_route_by_id(route_id):  
    airline_id = 1
    try:
        existing_route = AirlineRoute.query.filter_by(airline_id=airline_id, route_id=route_id).first()
        if not existing_route:
            return jsonify({"message": "Route not found"}), 404
        
        route = Route.query.filter_by(id=route_id).first()
        
        db.session.delete(route)
        db.session.commit()
        
        return jsonify({"message":"Route retrieved successfully", "route": route_schema.dump(route)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving route"}), 500
    



