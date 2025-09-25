
export enum UserRole {
    ADMIN = "Admin",
    PASSENGER = "Passenger",
    AIRLINE = "Airline"
}

export interface User {
    email : string,
    password : string
}