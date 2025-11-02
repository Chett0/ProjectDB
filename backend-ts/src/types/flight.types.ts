import { Decimal } from "@prisma/client/runtime/library"

interface Sort {
    sortBy : string,
    order: string
}

interface SearchFlightsParams {
    sort: Sort,
    departureAiportCity : string,
    arrivalAirportCity : string,
    layovers: number,
    departureDate: string,
    maxPrice: number
}

interface Flight {
    routeId : number,
    aircraftId : number,
    departureTime : Date,
    arrivalTime : Date,
    basePrice : number,
    durationSeconds : number
}


export type {
    Sort,
    SearchFlightsParams,
    Flight
}