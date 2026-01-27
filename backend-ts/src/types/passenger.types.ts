import { Prisma } from "@prisma/client"

export enum BookingState {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED"
}

export interface Ticket {
    flightId : number,
    passengerId : number,
    seatNumber: string,
    finalCost : number,
    state: BookingState,
    purchaseDate: Date
}

export type PassengerUser = Prisma.passengersGetPayload<{
    include: {
        users: true
    }
}>;