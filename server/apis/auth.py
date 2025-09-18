from flask import jsonify, request, Blueprint
from app.extensions import db, bcrypt
from models import User, Airline, UserRole, Passenger
from flask_jwt_extended import (
    create_access_token,
    get_jwt, 
    get_jwt_identity, 
    create_refresh_token,
    jwt_required
)
import secrets
import string
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

        if not password or not email or not name or not surname:
            return jsonify({
                    "message": "Missing required fields"
                }), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                    "message": "Email already in use"
                }), 409

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
        
        return jsonify({
                "message": "Passenger registered successfully"
            }), 201
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
                "message": "Error in passenger registration"
            }), 500
    

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
# @roles_required([UserRole.ADMIN.value])   For debugging
def register_airline():
    try:
        data = request.get_json()
        email = data["email"]
        name = data["name"] 
        code = data["code"]
        # password = data.get("password")

        if not email or not name or not code:
            return jsonify({
                    "message": "Missing required fields"
                }), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                    "message": "Email already in use"
                }), 409

        random_password = generate_random_password()

        hashed_password = bcrypt.generate_password_hash(password=random_password).decode('utf-8')

        new_user = User(
            email=email,
            password=hashed_password,
            role=UserRole.AIRLINE,
            must_change_password=True
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

        return jsonify({
                    "message": "Airline registered successfully",
                    "Password": random_password
                }), 201
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error on airline registration"
            }), 500
    

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data["email"]
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({
                    "message": "User not exists"
                }), 404
        
        if not user.active:
            return jsonify({
                    "message": "User not active"
                }), 401
        
        check = bcrypt.check_password_hash(user.password, password)

        if not check:
            return jsonify({
                    "message": "Wrong credential"
                }), 409
        
        additional_claims = {
            "role": user.role.value,
            "email": user.email
        }
        
        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims=additional_claims
        )

        refresh_token = create_refresh_token(
            identity=str(user.id), 
            additional_claims=additional_claims
        )

        if user.must_change_password:
            return jsonify(
                message="Password has to be changed",
                access_token=access_token, 
                refresh_token=refresh_token,
                role=user.role.value
            ), 303

        return jsonify(
                message = 'Login successfully', 
                refresh_token=refresh_token,
                access_token=access_token, 
                role=user.role.value
            ), 200
    except Exception as e:
        print(e)
        return jsonify({
                "message": "Internal error user login"
            }), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    new_access_token = create_access_token(
        identity=current_user_id,
        additional_claims={
                "role": claims.get("role"),
                "email": claims.get("email")
            },
    )
    return jsonify(
            message="Refreshed token succesffully",
            access_token=new_access_token
        )


@auth_bp.route("/password", methods=["PUT"])
@roles_required([UserRole.AIRLINE.value])
def change_password():
    try:
        airline_id = get_jwt_identity()
        data = request.get_json()

        new_password = data["password"]

        if not new_password:
            return jsonify({
                "message": "Missing required password"
            }), 400

        user = User.query.filter_by(id=airline_id).first()
        hashed_password = bcrypt.generate_password_hash(password=new_password).decode('utf-8')
        
        user.password = hashed_password
        user.must_change_password = False

        db.session.commit()

        return jsonify({
            "message": "Password change successful"
        }), 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
                "message": "Internal error changing password"
            }), 500