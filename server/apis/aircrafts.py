from flask import jsonify, request, Blueprint
from app.extensions import db, ma
from models import Aircraft

aircrafts_bp = Blueprint('aircraft', __name__)


# class RouteSchema(ma.SQLAlchemySchema):
#     class Meta:
#         model = Aircraft
    
#     id = ma.auto_field()
#     departure_airport = ma.Nested('AirportSchema')
#     arrival_airport = ma.Nested('AirportSchema')
#     airline = ma.Nested('AirlineSchema')

# singular_route_schema = RouteSchema()
# plural_route_schema = RouteSchema(many=True)

# @aircrafts_bp.route('/aircrafts', methods=['GET'])
# def get_aircrafts_by_airline():
#     airline_id = 1
#     try:
#         aircrafts = Aircraft.query.filter_by(airline_id=airline_id).all() 

#         return jsonify({"message":"Routes retrieved successfully", "routes": plural_route_schema.dump(aircrafts)}), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"message":"Error retrieving routes"}), 500
    

# @airlines_bp.route('/routes', methods=['POST'])
# def create_route():
#     #airline_code from jwt token
#     airline_id = 1
#     try:
#         data = request.get_json()


#         # id version
#         # new_route = Route(
#         #     departure_airport_id=data['departure_airport_id'],
#         #     arrival_airport_id=data['arrival_airport_id'],
#         #     airline_id=airline_id
#         # )

#         # code version
#         departure_airport_code = data['departure_airport_code']
#         arrival_airport_code = data['arrival_airport_code']

        

#         departure_airport_id = Airport.query.filter_by(code=departure_airport_code).first().id
#         arrival_airport_id = Airport.query.filter_by(code=arrival_airport_code).first().id

        

#         new_route = Route(
#             departure_airport_id=departure_airport_id,
#             arrival_airport_id=arrival_airport_id,
#             airline_id=airline_id
#         )

#         db.session.add(new_route)
#         db.session.commit()

#         return jsonify({'message': 'Route created successfully'}), 201

#     except Exception as e:
#         print(e)
#         return jsonify({"message":"Error retrieving routes"}), 500
    

# @airlines_bp.route('/routes/<int:route_id>', methods=['GET'])
# def get_route_by_id(route_id):  
#     airline_id = 1
#     try:
#         route = Route.query.filter_by(id=route_id, airline_id=airline_id).first()
#         if not route:
#             return jsonify({"message": "Route not found"}), 404
        
        
        
#         return jsonify({"message":"Route deleted successfully", "route": singular_route_schema.dump(route)}), 200
    
#     except Exception as e:
#         return jsonify({"message": "Error retrieving route"}), 500
    

# @airlines_bp.route('/routes/<int:route_id>', methods=['DELETE'])
# def delete_route_by_id(route_id):  
#     airline_id = 1
#     try:
#         route = Route.query.filter_by(id=route_id, airline_id=airline_id).first()
#         if not route:
#             return jsonify({"message": "Route not found"}), 404
        
#         db.session.delete(route)
#         db.session.commit()
        
#         return jsonify({"message":"Route retrieved successfully", "route": singular_route_schema.dump(route)}), 200
    
#     except Exception as e:
#         return jsonify({"message": "Error retrieving route"}), 500