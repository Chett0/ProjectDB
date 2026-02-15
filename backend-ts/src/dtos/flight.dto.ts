import { Decimal } from "@prisma/client/runtime/library";
import { flights, seatstate } from '@prisma/client';
import { AircraftDTO, AircraftInfoDTO, ClassDTO, toAircraftInfoDTO } from "./airline.dto";
import { AirportDTO, toAirportDTO } from "./airport.dto";
import { FlightInfo } from "../types/flight.types";


/**
 * @swagger
 * components:
 *   schemas:
 *     FlightInfoDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1001
 *         departureTime:
 *           type: string
 *           format: date-time
 *           example: 2026-03-01T10:00:00Z
 *         arrivalTime:
 *           type: string
 *           format: date-time
 *           example: 2026-03-01T13:30:00Z
 *         basePrice:
 *           type: number
 *           format: float
 *           example: 199.99
 *         aircraft:
 *           $ref: '#/components/schemas/AircraftInfoDTO'
 *         departureAirport:
 *           $ref: '#/components/schemas/AirportDTO'
 *         arrivalAirport:
 *           $ref: '#/components/schemas/AirportDTO'
 *       required:
 *         - id
 *         - departureTime
 *         - arrivalTime
 *         - basePrice
 *         - aircraft
 *         - departureAirport
 *         - arrivalAirport
 */
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


/**
 * @swagger
 * components:
 *   schemas:
 *     SeatsDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 501
 *         number:
 *           type: string
 *           example: 12A
 *         state:
 *           type: string
 *           enum:
 *             - AVAILABLE
 *             - RESERVED
 *             - OCCUPIED
 *           example: AVAILABLE
 *         price:
 *           type: number
 *           format: float
 *           example: 249.99
 *         class:
 *           $ref: '#/components/schemas/ClassDTO'
 *       required:
 *         - id
 *         - number
 *         - state
 *         - price
 *         - class
 */
export interface SeatsDTO {
    id: number;
    number: string;
    state: seatstate;
    price: number;
    class: ClassDTO;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     JourneysInfoDTO:
 *       type: object
 *       properties:
 *         totalDuration:
 *           type: integer
 *           description: Total journey duration in seconds
 *           example: 7200
 *         totalPrice:
 *           type: number
 *           format: float
 *           example: 350.50
 *         stops:
 *           type: integer
 *           example: 1
 *         flights:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FlightInfoDTO'
 *       required:
 *         - totalDuration
 *         - totalPrice
 *         - stops
 */
export interface JourneysInfoDTO {
    flights : FlightInfoDTO[];
    totalDuration : number;
    totalPrice : Decimal;
} 
