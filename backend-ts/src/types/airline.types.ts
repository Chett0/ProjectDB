import { Decimal } from "@prisma/client/runtime/library"
import { airlines } from "../../prisma/generated/prisma"

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

export type {
    Route,
    Extra,
    Aircraft, 
    Class
}