from flask import jsonify, request
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required, get_jwt
from models import User

def roles_required(allowed_roles):
    """
    Decorator to restrict access to endpoints based on user roles.

    This decorator ensures that only users with specified roles can access a route. It also 
    verifies that the user is active and authenticated using a JWT.

    Parameters:
        allowed_roles (list): A list of roles (strings) that are allowed to access the endpoint.

    Responses:
        - 401 Unauthorized: User is inactive or does not have the required role.
            {
                "message": "User not active" / "Unauthorized"
            }
        - 500 Internal Server Error: Unexpected error during authorization.
            {
                "message": "Internal authorization error"
            }

    Usage example:
        @app.route("/admin-only", methods=["GET"])
        @roles_required([UserRole.ADMIN.value])
        def admin_endpoint():
            return jsonify(message="Welcome, admin!")

    Notes:
        - The decorator uses `get_jwt_identity()` and `get_jwt()` to access user information.
        - The `@wraps(f)` decorator preserves the original function's metadata.
    """
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                current_user_id = get_jwt_identity()
                claims = get_jwt()

                user = User.query.filter_by(id=int(current_user_id)).first()

                if(not user.active):
                    return jsonify({
                        'message': 'User not active',
                    }), 401

                user_role = claims.get('role')
                if user_role not in allowed_roles:
                    return jsonify({
                        'message': 'Unhautorized',
                    }), 401
            
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({
                        'message': 'Internal authorization error'
                    }), 500
        
        return decorated_function
    return decorator