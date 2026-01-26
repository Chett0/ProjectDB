import { Prisma } from "@prisma/client";

export interface Sort {
    sortBy : string,
    order: string
}

export interface SearchFlightsParams {
    sort: Sort,
    departureAirportCity : string,
    arrivalAirportCity : string,
    layovers: number,
    departureDate: string,
    maxPrice: number
}

export interface Flight {
    routeId : number,
    aircraftId : number, 
    departureTime : Date,
    arrivalTime : Date,
    basePrice : number,
    durationSeconds : number
}

export type FlightInfo = Prisma.flightsGetPayload<{
    include: { 
        aircrafts: {
            include: {
                airlines: true
            }
        },
        routes: {
            include: {
                arrival_airport: true,
                departure_airport: true
            }
        }
    }
}>;

