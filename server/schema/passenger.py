from app.extensions import ma
from models import Passenger

class PassengerSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Passenger
    
    id = ma.Integer()
    name = ma.String()
    surname = ma.String()

passenger_schema = PassengerSchema()