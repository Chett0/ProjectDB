from flask import jsonify, Blueprint
from app.extensions import db
from models import Passenger, UserRole
from middleware.auth import roles_required

passengers_bp = Blueprint('passenger', __name__)


@passengers_bp.route('/passengers/count', methods=['GET'])
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
