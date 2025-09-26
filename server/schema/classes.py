from app.extensions import ma
from models import AircraftClass


class AircraftClassSchema(ma.SQLAlchemySchema):
    class Meta:
        model = AircraftClass

    id = ma.Integer()
    aircraft = ma.Nested('AircraftSchema')
    name = ma.String()
    seats_total = ma.Integer()
    price_multiplier = ma.Decimal(as_string=True)


aircraft_class_schema = AircraftClassSchema()
aircraft_classes_schema = AircraftClassSchema(many=True)
