import { Airline } from "./airlines"

export enum UserRole {
    ADMIN = "ADMIN",
    PASSENGER = "PASSENGER",
    AIRLINE = "AIRLINE"
}

export interface UserLogin {
    email : string,
    password : string
}


export interface CreatedAirline {
    user: UserLogin,
    airline: Airline
}