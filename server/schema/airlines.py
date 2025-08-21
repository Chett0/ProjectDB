from app.extensions import ma
from models import Airline

class AirlineSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Airline
    
    id = ma.Integer()
    email = ma.Email()
    name = ma.String()
    code = ma.String()

airline_schema = AirlineSchema()
airlines_schema = AirlineSchema(many=True)