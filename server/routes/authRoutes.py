from flask import jsonify, request
from server import app, bcrypt, db
from server.models import authModels

Passenger = authModels.Passenger
Airline = authModels.Airline

@app.route('/api/passengers/register', methods=['POST'])
def register_passenger():
    try:
        data = request.get_json()
        print(data)

        # required_fields = ["email", "password", "name", "surname"]
        # missing_fields = [field for field in required_fields if field not in data]
        # if missing_fields:
        #     return jsonify({"message": "User registration failed missing fields"}), 400

        email = data["email"]
        password = data["password"]
        name = data["name"] 
        surname = data["surname"]
        hashed_password = bcrypt.generate_password_hash(password=password).decode('utf-8')


        existing_user = Passenger.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "User with this email already exists"}), 409
        
        new_passenger = Passenger(
            email=email,
            password=hashed_password,
            name=name,
            surname=surname
        )
        
        db.session.add(new_passenger)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error user registration"}), 500
    

@app.route("/api/passengers/login", methods=["POST"])
def login_passenger():
    try:
        data = request.get_json()
        email = data["email"]
        password = data["password"]

        user = Passenger.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not exists"}), 409
        
        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"message": "Wrong credential"}), 409

        return jsonify({"message": "Login successfully", "id" : user.id}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error user login"}), 500
    




@app.route('/api/airlines/register', methods=['POST'])
def register_airline():
    try:
        data = request.get_json()
        print(data)

        email = data["email"]
        password = data["password"]
        name = data["name"] 
        code = data["code"]
        hashed_password = bcrypt.generate_password_hash(password=password).decode('utf-8')


        existing_airline = Airline.query.filter_by(code=code).first() 
        # or Airline.query.filter_by(email=email).first()
        if existing_airline:
            return jsonify({"message": "User with this email already exists"}), 409
        
        new_airline = Airline(
            email=email,
            password=hashed_password,
            name=name,
            code=code
        )
        
        db.session.add(new_airline)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error user registration"}), 500
    

@app.route("/api/airlines/login", methods=["POST"])
def login_airline():
    try:
        data = request.get_json()
        email = data["email"]
        password = data["password"]

        airline = Airline.query.filter_by(email=email).first()
        if not airline:
            return jsonify({"message": "Airline not exists"}), 409
        
        if not bcrypt.check_password_hash(airline.password, password):
            return jsonify({"message": "Wrong credential"}), 409

        return jsonify({"message": "Login successfully", "code" : airline.code}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error airline login"}), 500
