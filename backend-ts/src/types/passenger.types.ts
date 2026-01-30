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

export type FullTicketInfo = Prisma.ticketsGetPayload<{
    include: {
        seats: true,
        ticket_extra: {
            include: {
                extras: true
            }
        },
        flights: {
            include: {
                aircrafts : {
                    include: {
                        airlines: true
                    }
                },
                routes : {
                    include : {
                        departure_airport: true,
                        arrival_airport: true
                    }
                }
            }
        }
    }
}>;

export interface UserPassengerInfo {
    email: string,
    name: string,
    surname: string
}

export type PassengerUser = Prisma.passengersGetPayload<{
    include: {
        users: true
    }
}>;