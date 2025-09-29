from flask import jsonify, Blueprint
from flask_jwt_extended import decode_token, get_jwt, get_jwt_identity, jwt_required
from app.extensions import db
from models import Passenger, UserRole, Ticket, Flight, Aircraft, Airline
from sqlalchemy.orm import joinedload
from middleware.auth import roles_required
from schema import passenger_schema

passengers_bp = Blueprint('passenger', __name__)



@passengers_bp.route('passengers/count', methods=['GET'])
@roles_required([UserRole.ADMIN.value])
def get_passengers_count():
    try:
        count = Passenger.query.count()
        return jsonify({
                "message": "Passengers count retrieved", 
                "count": count
            }), 200
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error retrieving passengers count"
            }), 500


@passengers_bp.route('/passengers/me', methods=['GET'])
@roles_required([UserRole.PASSENGER.value])
def get_passenger():
    """
    Retrieves the profile information of the authenticated passenger.

    This endpoint is protected and only accessible by users with the PASSENGER role. It fetches
    the passenger record associated with the JWT identity and includes related user information.

    Responses:
        - 200 OK: Passenger successfully retrieved.
            {
                "message": "Passenger retrieved successfully",
                "passenger": <serialized_passenger_data>
            }
        - 404 Not Found: Passenger record does not exist.
            {
                "message": "Passenger not found"
            }
        - 500 Internal Server Error: Unexpected error while retrieving passenger data.
            {
                "message": "Error retrieving passenger info"
            }
    """
    try:
        user_id = int(get_jwt_identity())
        passenger = Passenger.query.options(joinedload(Passenger.user)).filter_by(id=user_id).first()
        if not passenger:
            return jsonify({
                'message': 'Passenger not found'
            }), 404
        return jsonify({
            "message": "Passenger retrieved successfully",
            "passenger": passenger_schema.dump(passenger)
        }), 200
    except Exception as e:
        print(e)
        return jsonify({
            'message': 'Error retrieving passenger info'
        }), 500



