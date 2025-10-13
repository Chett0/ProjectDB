import { Request } from "express";

export enum UserRole {
    ADMIN = "Admin",
    PASSENGER = "Passenger",
    AIRLINE = "Airline"
}

interface AuthenticatedUser {
    id : number, 
    role : string
}

interface AuthenticatedRequest extends Request{
    user : AuthenticatedUser
}

export type {
    AuthenticatedRequest,
    AuthenticatedUser
}