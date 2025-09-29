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
    """
    Registers a new passenger in the system.

    This endpoint accepts a POST request with passenger data (email, first name, last name, password),
    validates the input, checks for email uniqueness, hashes the password, and creates both the user
    and passenger records in the database.

    Request JSON body parameters:
        - email (str): The passenger's email address.
        - name (str): The passenger's first name.
        - surname (str): The passenger's last name.
        - password (str): The passenger's password.

    Responses:
        - 201 Created: Registration successful.
            {
                "message": "Passenger registered successfully"
            }
        - 400 Bad Request: Missing required fields.
            {
                "message": "Missing required fields"
            }
        - 409 Conflict: Email already in use.
            {
                "message": "Email already in use"
            }
        - 500 Internal Server Error: Unexpected error during registration.
            {
                "message": "Error in passenger registration"
            }

    Error handling:
        - On exception, the database session is rolled back to prevent partial changes.
    """

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
    """
    Generates a secure random password.

    The password will include at least one lowercase letter, one uppercase letter,
    one digit, and one special character (punctuation). The default length is 12 characters,
    but it can be customized by providing the 'length' parameter.

    Parameters:
        length (int, optional): The desired length of the password. Default is 12.

    Returns:
        str: A randomly generated password that meets the complexity requirements.
    """

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
    """
    Registers a new airline in the system. Only accessible by users with the ADMIN role.

    This endpoint accepts a POST request with airline details (email, name, and code),
    validates the input, ensures the email is unique, generates a random secure password,
    hashes it, and creates both the user and airline records in the database. The generated
    password is returned in the response, and the user will be required to change it on first login.

    Request JSON body parameters:
        - email (str): The airline's contact email.
        - name (str): The name of the airline.
        - code (str): The airline's unique code.

    Responses:
        - 201 Created: Airline registered successfully. Returns the generated password.
            {
                "message": "Airline registered successfully",
                "Password": "<generated_password>"
            }
        - 400 Bad Request: Missing required fields.
            {
                "message": "Missing required fields"
            }
        - 409 Conflict: Email already in use.
            {
                "message": "Email already in use"
            }
        - 500 Internal Server Error: Unexpected error during registration.
            {
                "message": "Internal error on airline registration"
            }

    Error handling:
        - Exceptions are caught and logged. No database rollback is explicitly called here, 
          so any uncommitted session changes will not be persisted.
    """
    try:
        data = request.get_json()
        email = data["email"]
        name = data["name"] 
        code = data["code"]

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
    """
    Authenticates a user and issues JWT access and refresh tokens.

    This endpoint accepts a POST request with the user's email and password, verifies the credentials,
    checks account status, and returns JWT tokens along with the user's role. If the user must change
    their password, a specific response is returned.

    Request JSON body parameters:
        - email (str): The user's email address.
        - password (str): The user's password.

    Responses:
        - 200 OK: Login successful, returns access and refresh tokens.
            {
                "message": "Login successfully",
                "access_token": "<access_token>",
                "refresh_token": "<refresh_token>",
                "role": "<user_role>"
            }
        - 303 See Other: User must change their password.
            {
                "message": "Password has to be changed",
                "role": "<user_role>"
            }
        - 404 Not Found: User does not exist or is inactive.
            {
                "message": "User not exists" / "User not active"
            }
        - 409 Conflict: Incorrect password.
            {
                "message": "Wrong credential"
            }
        - 500 Internal Server Error: Unexpected error during login.
            {
                "message": "Internal error user login"
            }

    Error handling:
        - Exceptions are caught and logged.
        - No database modifications occur in this function.
    """
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
                }), 404
        
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
    """
    Refreshes a user's JWT access token using a valid refresh token.

    This endpoint requires a valid refresh token in the request and issues a new access token
    containing the user's identity and claims (role and email).

    Responses:
        - 200 OK: Access token successfully refreshed.
            {
                "message": "Refreshed token successfully",
                "access_token": "<new_access_token>"
            }

    Requirements:
        - A valid refresh token must be provided in the request.
        - The endpoint is protected by `@jwt_required(refresh=True)`.

    Notes:
        - No database interaction occurs in this function.
        - Only the access token is refreshed; the refresh token remains valid until expiration.
    """

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
def change_password():
    """
    Allows a user to change their password.

    This endpoint accepts a PUT request with the user's email, old password, and new password.
    It validates the input, checks that the old password is correct, hashes the new password,
    updates the user's record, and marks that the user no longer needs to change their password.

    Request JSON body parameters:
        - email (str): The user's email address.
        - old_password (str): The user's current password.
        - new_password (str): The new password to be set.

    Responses:
        - 200 OK: Password changed successfully.
            {
                "message": "Password change successful"
            }
        - 400 Bad Request: Missing required fields.
            {
                "message": "Missing required fields"
            }
        - 404 Not Found: User not found.
            {
                "message": "User not found"
            }
        - 409 Conflict: Old password is incorrect.
            {
                "message": "Wrong password"
            }
        - 500 Internal Server Error: Unexpected error during password change.
            {
                "message": "Internal error changing password"
            }

    Error handling:
        - On exception, the database session is rolled back to prevent partial updates.
        - Exceptions are logged to the console.
    """
    try:
        data = request.get_json()

        email = data["email"]
        old_password = data["old_password"]
        new_password = data["new_password"]

        if not new_password or not old_password or not email:
            return jsonify({
                "message": "Missing required fields"
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "message": "User not found"
            }), 404

        check = bcrypt.check_password_hash(user.password, old_password)

        if not check:
            return jsonify({
                    "message": "Wrong password"
                }), 409

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
    




@auth_bp.route("/user/<int:user_id>", methods=["DELETE"])
@roles_required([UserRole.ADMIN.value])
def delete_user(user_id):
    """
    Soft-deletes a user by marking them as inactive. Only accessible by users with the ADMIN role.

    This endpoint accepts a DELETE request with the user's ID in the URL. It sets the user's `active`
    field to False instead of permanently deleting the record.

    URL Parameters:
        - user_id (int): The ID of the user to be deleted.

    Responses:
        - 200 OK: User successfully soft-deleted.
            {
                "message": "User deleted successfully"
            }
        - 404 Not Found: User not found.
            {
                "message": "User not found"
            }
        - 410 Gone: User is already inactive.
            {
                "message": "User not active"
            }
        - 500 Internal Server Error: Unexpected error during deletion.
            {
                "message": "Internal error deleting user"
            }

    Error handling:
        - On exception, the database session is rolled back to avoid partial updates.
        - Exceptions are logged to the console.
    """
    try:
        user = User.query.filter_by(id=user_id, active=True).first()

        if not user:
            return jsonify({
                    "message": "User not found"
                }), 404
        
        if not user.active:
            return jsonify({
                    "message": "User not active"
                }), 410
        
        user.active = False 
        db.session.commit()

        return jsonify({
                    "message": "User deleted successfully"
                }), 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
            "message": "Internal error deleting user"
        }), 500


