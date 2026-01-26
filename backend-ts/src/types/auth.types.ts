import { Request } from "express";
import { airlines, passengers, users } from '@prisma/client';


export enum UserRole {
    ADMIN = "ADMIN",
    PASSENGER = "PASSENGER",
    AIRLINE = "AIRLINE"
}

export interface PayloadJWT {
    id: number,
    role: string
}

export interface AuthenticatedUser {
    id : number, 
    role : string
}

export interface AuthenticatedRequest extends Request{
    user? : AuthenticatedUser
}


export interface User {
    email: string, 
    password: string,
    role: UserRole
}

export interface UserPassenger extends User {
    name: string,
    surname: string
}

export interface UserAirline extends User {
    name: string,
    code: string
}



export interface CreatePassengerResult {
  newUser: users;
  newPassenger: passengers;
}
