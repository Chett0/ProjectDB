from flask import jsonify, request
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required, get_jwt
from models import User

def roles_required(allowed_roles):
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