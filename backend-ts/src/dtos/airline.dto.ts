import { Decimal } from "@prisma/client/runtime/library";
import { AirportDTO, toAirportDTO } from "./airport.dto";
import { extras } from '@prisma/client';    
import { AirlineDTO, toAirlineDTO } from "./user.dto";
import { AircraftInfo, AirlineRoutes } from "../types/airline.types";

export interface AirlineRouteDTO {
    id: number;
    departureAirport: AirportDTO;
    arrivalAirport: AirportDTO;
}

export const toAirlineRouteDTO = (airlineRoute: AirlineRoutes): AirlineRouteDTO => ({
    id: airlineRoute.route_id,
    departureAirport: toAirportDTO(airlineRoute.routes.departure_airport),
    arrivalAirport: toAirportDTO(airlineRoute.routes.arrival_airport)
});

export interface ExtraDTO {
    id: number;
    name: string;
    price: Decimal;
}

export const toExtraDTO = (extra: extras): ExtraDTO => ({
    id: extra.id,
    name: extra.name,
    price: extra.price
});

export interface AirlineDashBoardDTO {
    passengerCount: number;
    monthlyIncome: number;
    activeRoutes: number;
    flightsInProgress: number;
    routesMostInDemand: RoutesMostInDemandDTO[];
    monthlyIncomes : MonthlyIncomeDTO[];
}

export interface ClassDTO {
    id: number;
    name: string;
    nSeats: number;
    priceMultiplier: number;
}


export interface AircraftDTO {
    id: number;
    model: string;
    nSeats: number;
    classes: ClassDTO[];
}

export interface AircraftInfoDTO {
    id: number;
    model: string;
    nSeats: number;
    airline: AirlineDTO;
}

export const toAircraftInfoDTO = (aircraft: AircraftInfo): AircraftInfoDTO => ({
    id: aircraft.id,
    model: aircraft.model,
    nSeats: aircraft.nSeats,
    airline: toAirlineDTO(aircraft.airlines)
});

export interface RoutesMostInDemandDTO {
    routeId : number;
    departureAirportName: string;
    arrivalAirportName: string;
    passengersCount: number;
}

export interface MonthlyIncomeDTO {
    month: string;
    income: number;
}
