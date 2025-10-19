import { Request } from "express";
import { airlines, passengers, users } from "../../prisma/generated/prisma";


export enum UserRole {
    ADMIN = "ADMIN",
    PASSENGER = "PASSENGER",
    AIRLINE = "AIRLINE"
}

interface AuthenticatedUser {
    id : number, 
    role : string
}

interface AuthenticatedRequest extends Request{
    user? : AuthenticatedUser
}


interface User {
    email: string, 
    password: string,
    role: UserRole
}

interface UserPassenger extends User {
    name: string,
    surname: string
}

interface UserAirline extends User {
    name: string,
    code: string
}



interface CreatePassengerResult {
  newUser: users;
  newPassenger: passengers;
}

interface CreateAirlineResult {
  newUser: users;
  newAirline: airlines;
}

export type {
    AuthenticatedRequest,
    AuthenticatedUser,
    User,
    UserPassenger,
    UserAirline,
    CreatePassengerResult,
    CreateAirlineResult
}