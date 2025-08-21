from app.extensions import db
from sqlalchemy.orm import Mapped, relationship, mapped_column
from enum import Enum

class UserRole(Enum):
    ADMIN = "Admin"
    AIRLINE = "Airline"
    PASSENGER = "Passenger"

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(db.String(100), nullable=False)
    role : Mapped[UserRole] = mapped_column(db.Enum(UserRole), nullable=False)
