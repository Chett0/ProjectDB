import { airlines } from "../../prisma/generated/prisma"

interface Route {
    departureAirportId : number,
    arrivalAirportId : number
}

export type {
    Route
}