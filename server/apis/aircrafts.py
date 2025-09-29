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
    """
    Retrieves all active aircrafts associated with the authenticated airline.

    This endpoint is protected and only accessible by users with the AIRLINE role. It fetches
    all active aircrafts for the airline identified by the JWT token.

    Responses:
        - 200 OK: Aircrafts successfully retrieved.
            {
                "message": "Aircrafts retrieved successfully",
                "aircrafts": [<list_of_aircrafts>]
            }
        - 500 Internal Server Error: Unexpected error while retrieving aircrafts.
            {
                "message": "Internal error retrieving aircrafts"
            }

    Requirements:
        - User must be authenticated with a valid JWT.
        - User must have the AIRLINE role.
    """
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
    """
    Creates a new aircraft for the authenticated airline and its associated classes.

    This endpoint is protected and only accessible by users with the AIRLINE role. It receives
    aircraft details along with class information and stores them in the database.

    Request JSON parameters:
        - model (str): The aircraft model.
        - nSeats (int): Total number of seats on the aircraft.
        - classes (list of dict): List of aircraft classes, each containing:
            - name (str): Name of the class (e.g., Economy, Business).
            - nSeats (int): Number of seats in this class.
            - price_multiplier (float): Price multiplier for this class relative to base fare.

    Responses:
        - 201 Created: Aircraft and its classes successfully created.
            {
                "message": "Aircraft created successfully"
            }
        - 400 Bad Request: Missing required fields in the request.
            {
                "message": "Missing field for creating aircraft"
            }
        - 500 Internal Server Error: Unexpected error during aircraft creation.
            {
                "message": "Internal error creating aircraft"
            }
    """
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
    """
    Retrieves details of a specific aircraft for the authenticated airline.

    This endpoint is protected and only accessible by users with the AIRLINE role. It fetches
    an aircraft by its ID, ensuring it belongs to the authenticated airline and is active.

    URL Parameters:
        - aircraft_id (int): The ID of the aircraft to retrieve.

    Responses:
        - 200 OK: Aircraft successfully retrieved.
            {
                "message": "Aircraft retrieved successfully",
                "aircraft": <serialized_aircraft_data>
            }
        - 404 Not Found: Aircraft does not exist or does not belong to the airline.
            {
                "message": "Aircraft not found"
            }
        - 410 Gone: Aircraft exists but is inactive.
            {
                "message": "Aircraft is not active"
            }
        - 500 Internal Server Error: Unexpected error while retrieving the aircraft.
            {
                "message": "Internal error retrieving aircraft"
            }
    """ 
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
    """
    Soft-deletes a specific aircraft for the authenticated airline by marking it as inactive.

    This endpoint is protected and only accessible by users with the AIRLINE role. It ensures
    that the aircraft belongs to the authenticated airline before performing a soft delete.

    URL Parameters:
        - aircraft_id (int): The ID of the aircraft to delete.

    Responses:
        - 200 OK: Aircraft successfully soft-deleted.
            {
                "message": "Aircraft deleted successfully",
                "aircraft": <serialized_aircraft_data>
            }
        - 404 Not Found: Aircraft does not exist or does not belong to the airline.
            {
                "message": "Aircraft not found"
            }
        - 410 Gone: Aircraft is already inactive.
            {
                "message": "Aircraft deleted"
            }
        - 500 Internal Server Error: Unexpected error while deleting the aircraft.
            {
                "message": "Internal error retrieving aircraft"
            }
    """
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
        
        
@aircrafts_bp.route('/aircrafts/<int:aircraft_id>/classes', methods=['GET'])
def get_aircraft_classes(aircraft_id):
    """
    Retrieves all classes for a specified aircraft.

    This endpoint accepts an `aircraft_id` as a query parameter and returns all associated
    aircraft classes. It is not restricted by user role.

    URL Parameters:
        - aircraft_id (int, required): The ID of the aircraft whose classes are to be retrieved.


    Responses:
        - 200 OK: Aircraft classes successfully retrieved.
            {
                "message": "Aircraft class retrieved successfully",
                "classes": [<serialized_class_data>]
            }
        - 400 Bad Request: Missing required `aircraft_id` parameter.
            {
                "message": "Missing aircraft_id"
            }
        - 404 Not Found: No classes found for the specified aircraft.
            {
                "message": "Class not found for id provided"
            }
        - 500 Internal Server Error: Unexpected error while retrieving aircraft classes.
            {
                "message": "Internal error retrieving aircraft class"
            }
    """  
    try:
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