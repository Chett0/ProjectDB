class Config(object):
    SECRET_KEY = '5791628bb0b13ce0c676dfde280ba245'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:1234@localhost:5432/ProjectDB'
    SQLALCHEMY_TRACK_MODIFICATIONS = False