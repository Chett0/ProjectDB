from flask import jsonify, request
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required, get_jwt

def roles_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                current_user = get_jwt_identity()
                claims = get_jwt()

                user_role = claims.get('role')
                if user_role not in allowed_roles:
                    return jsonify({
                        'message': 'Unhautorized',
                    }), 403
            
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'message': 'Authorization error'}), 401
        
        return decorated_function
    return decorator