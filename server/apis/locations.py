from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Flight, Route, Airport
# from flask_restful import Resource
from schema import airports_schema, airport_schema
from datetime import datetime
from sqlalchemy import distinct, func
from marshmallow import Schema, fields

locations_bp = Blueprint('location', __name__)



@locations_bp.route('/locations', methods = ['GET'])
def get_locations():
    """
    Searches for airports based on a query string and returns a list of matching locations.

    This endpoint accepts a query parameter and searches the Airport table for matches in the
    code, city, name, or country fields. Results are limited to 5 entries and returned in JSON format.

    Query Parameters:
        - query (str, optional): The search string to match against airport code, city, name, or country.

    Responses:
        - 200 OK: Locations successfully retrieved.
            {
                "message": "Locations retrieved successfully",
                "locations": [<serialized_airport_data>]
            }
        - 200 OK: No query passed.
            {
                "message": "No query passed"
            }
        - 400 Bad Request: Error occurred during query execution.
            {
                "message": "Error retrieving locations"
            }
    """
    try:
        query = request.args.get('query', "")

        if not query:
            return jsonify({
                    "message":"No query passed"
                }), 200
        
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
        return jsonify({
                "message":"Error retrieving locations"
            }), 400
        


@locations_bp.route('/cities', methods = ['GET'])
def get_cities():
    """
    Retrieves a list of all distinct cities where airports are located.

    This endpoint queries the database for unique city names from the Airport table and returns them
    in a JSON response. It is publicly accessible and does not require authentication.

    Responses:
        - 200 OK: Cities successfully retrieved.
            {
                "message": "Cities retrieved successfully",
                "cities": ["City1", "City2", ...]
            }
        - 500 Internal Server Error: Unexpected error while retrieving cities.
            {
                "message": "Error retrieving cities"
            }
    """
    try:
        cities = (
            db.session.query(distinct(Airport.city))
            .all()
        )

        city_list = [c[0] for c in cities]

        return jsonify({
                "message" : "Cities retrieved successfully",
                "cities": city_list
            }), 200

    except Exception as e:
        print("Error retrieving cities:", e)
        return jsonify({
                "message": "Error retrieving cities"
            }), 500