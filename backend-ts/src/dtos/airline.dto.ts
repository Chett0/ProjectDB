import { Decimal } from "@prisma/client/runtime/library";
import { AirportDTO, toAirportDTO } from "./airport.dto";
import { aircraft_classes, aircrafts, extras, routes } from '@prisma/client';    
import { AirlineDTO, toAirlineDTO } from "./user.dto";
import { AircraftWithClasses, AirlineRoute, AircraftWithAirlines, Route } from "../types/airline.types";

export interface RouteDTO {
    id: number;
    departureAirport: AirportDTO;
    arrivalAirport: AirportDTO;
}

export const toRouteDTO = (airlineRoute: AirlineRoute | Route): RouteDTO => {
    if("airline_id" in airlineRoute){
        return {
            id: airlineRoute.route_id,
            departureAirport: toAirportDTO(airlineRoute.routes.departure_airport),
            arrivalAirport: toAirportDTO(airlineRoute.routes.arrival_airport)
        }
    }
    else {
        return {
            id: airlineRoute.id,
            departureAirport: toAirportDTO(airlineRoute.departure_airport),
            arrivalAirport: toAirportDTO(airlineRoute.arrival_airport)
        }
    }
    
};

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

export const toClassDTO = (aircraftClass: aircraft_classes): ClassDTO => ({
    id: aircraftClass.id,
    name: aircraftClass.name,
    nSeats: aircraftClass.nSeats,
    priceMultiplier: aircraftClass.price_multiplier.toNumber()
});


export interface AircraftDTO {
    id: number;
    model: string;
    nSeats: number;
    classes: ClassDTO[];
}

export const toAircraftDTO = (aircraft: AircraftWithClasses): AircraftDTO => ({
    id: aircraft.id,
    model: aircraft.model,
    nSeats: aircraft.nSeats,
    classes: aircraft.aircraft_classes.map(toClassDTO)
});

export interface AircraftInfoDTO {
    id: number;
    model: string;
    nSeats: number;
    airline: AirlineDTO;
}

export const toAircraftInfoDTO = (aircraft: AircraftWithAirlines): AircraftInfoDTO => ({
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
