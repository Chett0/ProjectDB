import { User } from "./auth";

export interface Passenger {
    name : string,
    surname : string,
}

export type PassengerAsUser = Passenger & User