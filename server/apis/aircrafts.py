from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Aircraft, AircraftClass, Flight
from schema import aircraft_schema, aircrafts_schema, aircraft_classes_schema
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from middleware.auth import roles_required
from models import UserRole

aircrafts_bp = Blueprint('aircraft', __name__)

@aircrafts_bp.route('/aircrafts', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_aircrafts_by_airline():
    try:
        airline_id = get_jwt_identity()
        aircrafts = Aircraft.query.filter_by(airline_id=airline_id, active=True).all() 

        return jsonify({
                "message":"Aircrafts retrieved successfully", 
                "aircrafts": aircrafts_schema.dump(aircrafts)
            }), 200

    except Exception as e:
        print(e)
        return jsonify({
                "message":"Internal error retrieving aircrafts"
            }), 500
    

@aircrafts_bp.route('/aircrafts', methods=['POST'])
@roles_required([UserRole.AIRLINE.value])
def create_aircraft():
    try:
        airline_id = get_jwt_identity()
        data = request.get_json()

        model = data['model']
        nSeats = data['nSeats']
        classes = data['classes']

        if(not model or not nSeats or not classes):
            return jsonify({
                    'message': 'Missing field for creating aircraft'
                }), 400
        
    
        new_aircraft = Aircraft(
            model=model,
            nSeats=nSeats,
            airline_id=airline_id
        )

        db.session.add(new_aircraft)
        db.session.flush()

        for c in classes:
            new_class = AircraftClass(
                name = c["name"],
                nSeats = c["nSeats"],
                price_multiplier = c["price_multiplier"],
                aircraft_id = new_aircraft.id
            )

            db.session.add(new_class)


        db.session.commit()

        return jsonify({
                'message': 'Aircraft created successfully'
            }), 201

    except Exception as e:  
        print(e)
        db.session.rollback()
        return jsonify({
                "message":"Internal error creating aircraft"
            }), 500
    

@aircrafts_bp.route('/aircrafts/<int:aircraft_id>', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_aircraft_by_id(aircraft_id):  
    try:
        airline_id = get_jwt_identity()
        aircraft = Aircraft.query.filter_by(id=aircraft_id, airline_id=airline_id).first()
        if not aircraft:
            return jsonify({
                    "message": "Aircraft not found"
                }), 404
        
        if not aircraft.active:
            return jsonify({
                    "message": "Aircraft is not active"
                }), 410

        return jsonify({
                "message":"Aircraft retrieved successfully", 
                "aircraft": aircraft_schema.dump(aircraft)
            }), 200
    
    except Exception as e:
        return jsonify({
                "message": "Internal error retrieving aircraft"
            }), 500
    

@aircrafts_bp.route('/aircrafts/<int:aircraft_id>', methods=['DELETE'])
@roles_required([UserRole.AIRLINE.value])
def delete_aircraft_by_id(aircraft_id):  
    try:
        airline_id = get_jwt_identity()
        aircraft = Aircraft.query.filter_by(id=aircraft_id, airline_id=airline_id).first()
        if not aircraft:
            return jsonify({
                    "message": "Aircraft not found"
                }), 404
        
        if not aircraft.active:
            return jsonify({
                "message": "Aircraft deleted"
            }), 410

        aircraft.active = False
        db.session.commit()
        
        return jsonify({
                "message":"Aircraft deleted successfully", 
                "aircraft": aircraft_schema.dump(aircraft)
            }), 200
    
    except Exception as e:
        return jsonify({
                "message": "Internal error retrieving aircraft"
            }), 500


@aircrafts_bp.route('/aircrafts/count', methods=['GET'])
@roles_required([UserRole.AIRLINE.value])
def get_aircrafts_count():
    try:
        airline_id = get_jwt_identity()
        count = Aircraft.query.filter_by(airline_id=airline_id, active=True).count()
        return jsonify({
                "message": "Aircrafts count retrieved successfully",
                "count": count
            }), 200
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error retrieving aircraft count"
            }), 500
        
        
@aircrafts_bp.route('/aircraft/classes', methods=['GET'])
def get_aircraft_classes():  
    try:
        aircraft_id = request.args.get('aircraft_id', type=int)
        if not aircraft_id:
            return jsonify({"message": "Missing aircraft_id"}), 400
        
        aircraft_class = AircraftClass.query.filter_by(aircraft_id=aircraft_id).all()
        if not aircraft_class:
            return jsonify({
                    "message": "Class not found for id provided"
                }), 404

        return jsonify({
                "message":"Aircaft class retrieved successfully", 
                "classes": aircraft_classes_schema.dump(aircraft_class)
            }), 200
    
    except Exception as e:
        return jsonify({
                "message": "Internal error retrieving aircraft class"
            }), 500