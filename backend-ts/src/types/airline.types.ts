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

export type {
    Route,
    Extra
}