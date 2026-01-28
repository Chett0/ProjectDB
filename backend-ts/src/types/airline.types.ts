import { Decimal } from "@prisma/client/runtime/library"
import { Prisma } from "@prisma/client";

//#region Airline routes

export type Route = Prisma.routesGetPayload<{
    include : {
        departure_airport : true,
        arrival_airport : true
    }
}>;

export type AirlineRoute = Prisma.airlineRouteGetPayload<{
    include : {
        routes : {
            include : {
                departure_airport : true,
                arrival_airport : true
            }
        }
    }
}>;

//#endregion

export interface Extra {
    airlineId: number,
    name: string,
    price: Decimal
}

export interface Class {
    name: string,
    nSeats : number,
    priceMultiplier: Decimal
}

export interface CreateAircraft {
    airlineId: number,
    model: string,
    nSeats: number,
    classes: Class[]
}


export type AircraftWithAirlines = Prisma.aircraftsGetPayload<{
    include: {
        airlines: true
    }
}>;

export interface RoutesMostInDemand {
    id: number, 
    passengersCount : number
}


export type AircraftWithClasses = Prisma.aircraftsGetPayload<{
    include : {
        aircraft_classes : true
    }
}>;