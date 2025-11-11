import { Decimal } from "@prisma/client/runtime/library"

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