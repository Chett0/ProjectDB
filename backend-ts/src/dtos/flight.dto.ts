import { Decimal } from "@prisma/client/runtime/library";
import { flights, seatstate } from '@prisma/client';
import { AircraftDTO, AircraftInfoDTO, ClassDTO, toAircraftInfoDTO } from "./airline.dto";
import { AirportDTO, toAirportDTO } from "./airport.dto";
import { FlightInfo } from "../types/flight.types";

export interface FlightInfoDTO {
    id: number;
    departureTime: Date;
    arrivalTime: Date;
    basePrice: Decimal;
    aircraft: AircraftInfoDTO;
    departureAirport: AirportDTO;
    arrivalAirport: AirportDTO;
}

export const toFlightInfoDTO = (flight : FlightInfo) : FlightInfoDTO => ({
    id: flight.id,
    departureTime: flight.departure_time,
    arrivalTime: flight.arrival_time,
    basePrice: flight.base_price,
    aircraft: toAircraftInfoDTO(flight.aircrafts),
    departureAirport: toAirportDTO(flight.routes.departure_airport),
    arrivalAirport: toAirportDTO(flight.routes.arrival_airport)
});

export interface SeatsDTO {
    id: number;
    number: string;
    state: seatstate;
    price: number;
    class: ClassDTO;
}

export interface JourneysInfoDTO {
    flights : FlightInfoDTO[];
    totalDuration : number;
    totalPrice : Decimal;
} 
