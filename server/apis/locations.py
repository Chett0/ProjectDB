from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Flight, Route, Airport
# from flask_restful import Resource
from schema import airports_schema, airport_schema
from datetime import datetime
from sqlalchemy import func
from marshmallow import Schema, fields

locations_bp = Blueprint('location', __name__)



@locations_bp.route('/locations', methods = ['GET'])
def get_locations():
    try:
        query = request.args.get('query', "")

        if not query:
            return jsonify({"message":"No query passed"}), 200
        
        locations = Airport.query.filter(
            (Airport.code.ilike(f"{query}%")) | 
            (Airport.city.ilike(f"{query}%")) | 
            (Airport.name.ilike(f"{query}%")) |
            (Airport.country.ilike(f"%{query}%")) 
        ).limit(5).all()

        return jsonify({
            "message":"Locations retrieved successfully",
            "locations" : airports_schema.dump(locations)
        }), 200
    
    except Exception as e:
        print(e)
        return jsonify({"message":"Error retrieving locations"}), 400