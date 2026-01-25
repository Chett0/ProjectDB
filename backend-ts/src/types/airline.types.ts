import { Decimal } from "@prisma/client/runtime/library"
import { Prisma } from "@prisma/client";

interface Route {
    departureAirportId : number,
    arrivalAirportId : number
}

interface Extra {
    name: string,
    price: Decimal
}

interface Class {
    name: string,
    nSeats : number,
    priceMultiplier: Decimal
}

interface Aircraft {
    model: string,
    nSeats: number,
    classes: Class[]
}


export type AircraftInfo = Prisma.aircraftsGetPayload<{
    include: {
        airlines: true
    }
}>;

interface RoutesMostInDemand {
    id: number, 
    passengersCount : number
}

export type {
    Route,
    Extra,
    Aircraft, 
    Class,
    RoutesMostInDemand
}