from app.extensions import ma
from models import Airport

class AirportSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Airport
    
    # id = ma.Integer()
    name = ma.String()
    code = ma.String()
    city = ma.String()
    country = ma.String()

airport_schema = AirportSchema()
airports_schema = AirportSchema(many=True)