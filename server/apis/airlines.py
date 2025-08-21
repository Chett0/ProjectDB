from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Airline, Route, Airport
from flask_restful import Resource
from schema import route_schema, routes_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from auth import check_user_role

airlines_bp = Blueprint('airline', __name__)

# Routes 

@airlines_bp.route('/routes', methods=['GET'])
@jwt_required()
def get_routes():
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt()["role"]
        if not check_user_role(user_role, "Airline"):
            return jsonify({"message": "Unauthorized access"}), 403
        


        routes = Route.query.filter_by(airline_id=user_id).all() 

        return jsonify({"message":"Routes retrieved successfully", "routes": routes_schema.dump(routes)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving routes"}), 500
    

@airlines_bp.route('/routes', methods=['POST'])
def create_route():
    #airline_code from jwt token
    airline_id = 5
    try:
        data = request.get_json()


        # id version
        # new_route = Route(
        #     departure_airport_id=data['departure_airport_id'],
        #     arrival_airport_id=data['arrival_airport_id'],
        #     airline_id=airline_id
        # )

        # code version
        departure_airport_code = data['departure_airport_code']
        arrival_airport_code = data['arrival_airport_code']

        

        departure_airport_id = Airport.query.filter_by(code=departure_airport_code).first().id
        arrival_airport_id = Airport.query.filter_by(code=arrival_airport_code).first().id

        

        new_route = Route(
            departure_airport_id=departure_airport_id,
            arrival_airport_id=arrival_airport_id,
            airline_id=airline_id
        )

        db.session.add(new_route)
        db.session.commit()

        return jsonify({'message': 'Route created successfully'}), 201

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving routes"}), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['GET'])
def get_route_by_id(route_id):  
    airline_id = 1
    try:
        route = Route.query.filter_by(id=route_id, airline_id=airline_id).first()
        if not route:
            return jsonify({"message": "Route not found"}), 404
        
        
        
        return jsonify({"message":"Route deleted successfully", "route": route_schema.dump(route)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving route"}), 500
    

@airlines_bp.route('/routes/<int:route_id>', methods=['DELETE'])
def delete_route_by_id(route_id):  
    airline_id = 1
    try:
        route = Route.query.filter_by(id=route_id, airline_id=airline_id).first()
        if not route:
            return jsonify({"message": "Route not found"}), 404
        
        db.session.delete(route)
        db.session.commit()
        
        return jsonify({"message":"Route retrieved successfully", "route": route_schema.dump(route)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving route"}), 500
    



    


@airlines_bp.route('/flights', methods=['GET'])
def get_flights_by_airlineId():
    airline_id = 1
    try:
        page_number = request.args.get('page', 1, type=int)
        page_size = request.args.get('size', 10, type=int)

        flights_query =  Flight.query.join(Route).filter(Route.airline_id == airline_id)

        return jsonify({"message":"F retrieved successfully", "routes": plural_route_schema.dump(routes)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving routes"}), 500