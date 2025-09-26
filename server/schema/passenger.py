
from app.extensions import ma
from models import Passenger, User


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
    email = ma.String()

class PassengerSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Passenger
    id = ma.Integer()
    name = ma.String()
    surname = ma.String()
    user = ma.Nested(UserSchema, only=("email",))

passenger_schema = PassengerSchema()