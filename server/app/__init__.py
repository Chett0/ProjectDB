from flask import Flask
from app.config import Config
from flask_migrate import Migrate
from app.extensions import db, ma, bcrypt, jwt

from apis.airlines import airlines_bp
from apis.auth import auth_bp
from apis.aircrafts import aircrafts_bp
from apis.flights import flights_bp

# For migrations

def create_app_with_migration():
    app = Flask(__name__)           
    app.config.from_mapping(
        SECRET_KEY = "5791628bb0b13ce0c676dfde280ba245"
    )     
    
    app.config.from_object(Config)

    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    from models import Aircraft, Airline, Route, Airport
    migrate = Migrate(app, db)

    return app

app = create_app_with_migration()

app.register_blueprint(airlines_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(aircrafts_bp, url_prefix='/api')
app.register_blueprint(flights_bp, url_prefix='/api')

if __name__ == '__main__':
   app.run()    # flask --app app run

# from apis import auth, airlines


