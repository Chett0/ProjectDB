from app.extensions import ma
from models import Extra



class ExtraSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Extra

    id = ma.Integer()
    name = ma.String()
    price = ma.Decimal(as_string=True)
    active = ma.Boolean()
    deletion_time = ma.DateTime(allow_none=True)


extra_schema = ExtraSchema()
extras_schema = ExtraSchema(many=True)
