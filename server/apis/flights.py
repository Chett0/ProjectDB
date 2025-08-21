from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Flight, Route, Airport, AirlineRoute
from flask_restful import Resource
from schema import flights_schema, flight_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from apis.auth import check_user_role
from datetime import datetime

flights_bp = Blueprint('flight', __name__)

@flights_bp.route('/flights', methods=['POST'])
def create_flight():
    try:
        data = request.get_json()

        route_id = data["route_id"]
        aircraft_id = data["aircraft_id"]

        # departure_time = data["departure_time"]     # YY-MM-DD-H-m
        # arrival_time = data["arrival_time"]

        new_flight = Flight(
            route_id=route_id,
            aircraft_id=aircraft_id,
            departure_time=datetime(2025, 3, 15, 14, 30),
            arrival_time=datetime(2025, 3, 15, 18, 30)
        )

        db.session.add(new_flight)
        db.session.commit()

        return jsonify({"message":"Flight created successfully"}), 201

    except Exception as e:
        return jsonify({"message":"Error creating flight"}), 500
    

@flights_bp.route('/flights', methods=['GET'])
def get_flight():
    try:
        page_number = request.args.get('page_number', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        sort_by = request.args.get('sort_by', 'departure_time')
        order = request.args.get('order', 'asc').lower()
        departure_from = request.args.get('from')
        arrival_to = request.args.get('to')


        flights_query = Flight.query.outerjoin(Route).outerjoin(Airport, Route.departure_airport_id == Airport.id)

        filters = []

        if(departure_from):
            flights_query = flights_query.where(Airport.code == departure_from)

        # flights_query = flights_query.outerjoin(Airport, Route.arrival_airport == Airport.id)

        total_flights = flights_query.count()
        if total_flights == 0:
            return jsonify({
                'message':'Fligths retrieved successfully',
                'flights' : [],
                'total_pages' : 0 
            })
        
        total_pages = (total_flights + limit - 1) / limit 
        offset = (page_number - 1) * limit

        flights = flights_query.offset(offset=offset).limit(limit=limit).all()

        return jsonify({
                'message':'Fligths retrieved successfully',
                'flights' : flights_schema.dump(flights),
                'total_pages' : total_pages 
        }), 200



    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving flights"}), 500
    


@flights_bp.route('/flights/<int:flight_id>', methods=['GET'])
def get_flight_by_id(flight_id):  
    try:
        flight = Flight.query.filter_by(id=flight_id).first()
        if not flight:
            return jsonify({"message": "Flight not found"}), 404
        
        return jsonify({"message":"Flight retrieved successfully", "aircraft": flight_schema.dump(flight)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving flight"}), 500
