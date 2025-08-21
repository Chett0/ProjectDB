from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Aircraft
from schema import aircraft_schema, aircrafts_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from apis.auth import check_user_role

aircrafts_bp = Blueprint('aircraft', __name__)


@aircrafts_bp.route('/aircrafts', methods=['GET'])
def get_aircrafts_by_airline():
    airline_id = 1
    try:
        aircrafts = Aircraft.query.filter_by(airline_id=airline_id).all() 

        return jsonify({"message":"Aircrafts retrieved successfully", "aircrafts": aircrafts_schema.dump(aircrafts)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving aircrafts"}), 500
    

@aircrafts_bp.route('/aircrafts', methods=['POST'])
def create_aircraft():
    #airline_code from jwt token
    airline_id = 1
    try:
        data = request.get_json()

        model = data['model']
        nSeats = data['nSeats']
    
        new_airline = Aircraft(
            model=model,
            nSeats=nSeats,
            airline_id=airline_id
        )

        db.session.add(new_airline)
        db.session.commit()

        return jsonify({'message': 'Aircraft created successfully'}), 201

    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving aircraft"}), 500
    

@aircrafts_bp.route('/aircrafts/<int:aircraft_id>', methods=['GET'])
def get_aircraft_by_id(aircraft_id):  
    airline_id = 1
    try:
        aircraft = Aircraft.query.filter_by(id=aircraft_id, airline_id=airline_id).first()
        if not aircraft:
            return jsonify({"message": "Aircraft not found"}), 404
        
        
        
        return jsonify({"message":"Aircraft deleted successfully", "aircraft": aircraft_schema.dump(aircraft)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving aircraft"}), 500
    

@aircrafts_bp.route('/aircrafts/<int:aircraft_id>', methods=['DELETE'])
def delete_aircraft_by_id(aircraft_id):  
    airline_id = 1
    try:
        aircraft = Aircraft.query.filter_by(id=aircraft_id, airline_id=airline_id).first()
        if not aircraft:
            return jsonify({"message": "Aircraft not found"}), 404
        
        db.session.delete(aircraft)
        db.session.commit()
        
        return jsonify({"message":"Aircraft retrieved successfully", "aircraft": aircraft_schema.dump(aircraft)}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving aircraft"}), 500