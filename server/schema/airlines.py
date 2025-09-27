from app.extensions import ma
from models import Airline
from marshmallow import Schema, fields

class AirlineSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Airline
    
    id = ma.Integer()
    email = ma.Email()
    name = ma.String()
    code = ma.String()

airline_schema = AirlineSchema()
airlines_schema = AirlineSchema(many=True)




class AirlineDashboardSchema(Schema):
    passenger_count = ma.Integer()
    monthly_income = ma.Float()
    active_routes = ma.Integer()
    flights_in_progress = ma.Integer()

airline_dashboard_schema = AirlineDashboardSchema()
airline_dashboards_schema = AirlineDashboardSchema(many=True)