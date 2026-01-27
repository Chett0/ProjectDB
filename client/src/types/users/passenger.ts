import { UserLogin } from "./auth";
import { Response } from "../responses/responses";

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

export interface PassengerInfo {
    id: number,
    name: string,
    surname: string,
    email: string
}

export interface PassengerResolverResponse {
    passengerResponse: Response<PassengerInfo>;
}