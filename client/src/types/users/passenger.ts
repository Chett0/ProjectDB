import { UserLogin } from "./auth";

export enum UserRole {
    PASSENGER = 'Passenger',
    AIRLINE = 'Airline',
    ADMIN = 'Admin'
}

export interface Passenger {
    name : string,
    surname : string,
}

export type PassengerAsUser = Passenger & UserLogin