import { Decimal } from "@prisma/client/runtime/library"
import { Prisma } from "@prisma/client";

export interface Route {
    departureAirportId : number,
    arrivalAirportId : number
}

export interface Extra {
    name: string,
    price: Decimal
}

export interface Class {
    name: string,
    nSeats : number,
    priceMultiplier: Decimal
}

export interface Aircraft {
    model: string,
    nSeats: number,
    classes: Class[]
}


export type AircraftInfo = Prisma.aircraftsGetPayload<{
    include: {
        airlines: true
    }
}>;

export interface RoutesMostInDemand {
    id: number, 
    passengersCount : number
}


export type AirlineRoutes = Prisma.airlineRouteGetPayload<{
    include : {
        routes : {
            include : {
                departure_airport : true,
                arrival_airport : true
            }
        }
    }
}>;