import { AirportDTO } from "./airport.dto";

interface AirlineRouteDTO {
    id: number,
    departureAirport : AirportDTO
    arrivalAirport : AirportDTO
}

export type {
    AirlineRouteDTO
}