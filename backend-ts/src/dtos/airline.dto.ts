import { Decimal } from "@prisma/client/runtime/library";
import { AirportDTO } from "./airport.dto";

interface AirlineRouteDTO {
    id: number,
    departureAirport : AirportDTO
    arrivalAirport : AirportDTO
}

interface ExtraDTO {
    id: number,
    name: string,
    price: Decimal
}

interface DashBoardDTO {
    passengerCount : number,
    monthlyIncome: number,
    activeRoutes: number,
    filghtsInProgress: number
}

export type {
    AirlineRouteDTO,
    ExtraDTO,
    DashBoardDTO
}