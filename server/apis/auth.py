from flask import jsonify, request, Blueprint
from app.extensions import db, bcrypt
from models import User, Airline, UserRole, Passenger
from flask_jwt_extended import create_access_token

from middleware.auth import roles_required


auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/passengers/register', methods=['POST'])
def register_passenger():
    try:
        data = request.get_json()

        email = data["email"]
        name = data["name"] 
        surname = data["surname"]
        password = data["password"]

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already in use"}), 409

        hashed_password = bcrypt.generate_password_hash(password=password).decode('utf-8')

        new_user = User(
            email=email,
            password=hashed_password,
            role=UserRole.PASSENGER
        )

        db.session.add(new_user)
        db.session.flush()
        
        new_passenger = Passenger(
            id=new_user.id,
            name=name,
            surname=surname
        )
        
        db.session.add(new_passenger)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(e)
        return jsonify({"message": "Error in airline registration"}), 500
    

import secrets
import string

def generate_random_password(length=12):

    alphabet = string.ascii_letters + string.digits + string.punctuation

    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))

        if (any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in string.punctuation for c in password)):
            return password


@auth_bp.route('/airlines/register', methods=['POST'])
@roles_required([UserRole.ADMIN.value])
def register_airline():
    try:
        data = request.get_json()
        email = data["email"]
        name = data["name"] 
        code = data["code"]
        password = data.get("password")

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already in use"}), 409

        if not password:
            return jsonify({"message": "Password richiesta"}), 400

        hashed_password = bcrypt.generate_password_hash(password=password).decode('utf-8')

        new_user = User(
            email=email,
            password=hashed_password,
            role=UserRole.AIRLINE
        )

        db.session.add(new_user)
        db.session.flush()

        new_airline = Airline(
            id=new_user.id,
            name=name,
            code=code
        )

        db.session.add(new_airline)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(e)
        return jsonify({"message": "Error in airline registration"}), 500
    

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data["email"]
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not exists"}), 409
        
        check = bcrypt.check_password_hash(user.password, password)

        if not check:
            return jsonify({"message": "Wrong credential"}), 409

        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims={
                "role": user.role.value,
                "email": user.email
            }
        )

        return jsonify(message = 'Login successfully', access_token=access_token, role=user.role.value), 200
    except Exception as e:
        print(e, flush=True)
        return jsonify({"message": "Error user login"}), 500
