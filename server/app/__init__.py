from datetime import timedelta
from flask import Flask
from app.config import Config
from flask_migrate import Migrate
from app.extensions import db, ma, bcrypt, jwt
from flask_cors import CORS

from apis.airlines import airlines_bp
from apis.auth import auth_bp
from apis.aircrafts import aircrafts_bp
from apis.flights import flights_bp
from apis.locations import locations_bp
from apis.tickets import tickets_bp
from apis.passengers import passengers_bp


from models import Flight, Ticket
from models import *

# For migrations

def create_app_with_migration():
    app = Flask(__name__)
    # Allow cross-origin requests from the frontend dev server and allow Authorization header
    # so browser preflight (OPTIONS) doesn't block requests with Authorization.
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:4200"]}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
    app.config.from_mapping(
        SECRET_KEY = "5791628bb0b13ce0c676dfde280ba245"
    )     

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=15)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
    
    app.config.from_object(Config)

    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate = Migrate(app, db)

    return app

app = create_app_with_migration()

url_prefix = '/api'

app.register_blueprint(airlines_bp, url_prefix=url_prefix)
app.register_blueprint(auth_bp, url_prefix=url_prefix)
app.register_blueprint(aircrafts_bp, url_prefix=url_prefix)
app.register_blueprint(flights_bp, url_prefix=url_prefix)
app.register_blueprint(locations_bp, url_prefix=url_prefix)
app.register_blueprint(tickets_bp, url_prefix=url_prefix)
app.register_blueprint(passengers_bp, url_prefix=url_prefix)

if __name__ == '__main__':
   app.run()    # flask --app app run

# from apis import auth, airlines


