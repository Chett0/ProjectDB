import { Decimal } from "@prisma/client/runtime/library";
import { AirportDTO, toAirportDTO } from "./airport.dto";
import { aircraft_classes, aircrafts, extras, routes } from '@prisma/client';    
import { AirlineDTO, toAirlineDTO } from "./user.dto";
import { AircraftWithClasses, AirlineRoute, AircraftWithAirlines, Route } from "../types/airline.types";

/**
 * @swagger
 * components:
 *   schemas:
 *     RouteDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         departureAirport:
 *           $ref: '#/components/schemas/AirportDTO'
 *         arrivalAirport:
 *           $ref: '#/components/schemas/AirportDTO'
 *       required:
 *         - id
 *         - departureAirport
 *         - arrivalAirport
 *
 */
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


/**
 * @swagger
 * components:
 *   schemas:
 *     ExtraDTO:
 *       type: object
 *       properties:
 *         id: 
 *          type: integer
 *          example: 1
 *         name:
 *           type: string
 *           example: Extra legroom
 *         price:
 *           type: number
 *           format: decimal
 *           example: 29.99
 *       required:
 *         - id
 *         - name
 *         - price
 */

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

/**
 * @swagger
 * components:
 *   schemas:
 *     RoutesMostInDemandDTO:
 *       type: object
 *       properties:
 *         routeId:
 *           type: integer
 *           example: 101
 *         origin:
 *           type: string
 *           example: London
 *         destination:
 *           type: string
 *           example: Paris
 *         bookings:
 *           type: integer
 *           example: 350
 *       required:
 *         - routeId
 *         - origin
 *         - destination
 *         - bookings
 *
 *     MonthlyIncomeDTO:
 *       type: object
 *       properties:
 *         month:
 *           type: integer
 *           example: 1
 *         income:
 *           type: number
 *           format: float
 *           example: 12500.50
 *       required:
 *         - month
 *         - income
 *
 *     AirlineDashBoardDTO:
 *       type: object
 *       properties:
 *         passengerCount:
 *           type: integer
 *           example: 1200
 *         monthlyIncome:
 *           type: number
 *           format: float
 *           example: 125000.75
 *         activeRoutes:
 *           type: integer
 *           example: 35
 *         flightsInProgress:
 *           type: integer
 *           example: 5
 *         routesMostInDemand:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoutesMostInDemandDTO'
 *         monthlyIncomes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonthlyIncomeDTO'
 *       required:
 *         - passengerCount
 *         - monthlyIncome
 *         - activeRoutes
 *         - flightsInProgress
 *         - routesMostInDemand
 *         - monthlyIncomes
 */
export interface AirlineDashBoardDTO {
    passengerCount: number;
    monthlyIncome: number;
    activeRoutes: number;
    flightsInProgress: number;
    routesMostInDemand: RoutesMostInDemandDTO[];
    monthlyIncomes : MonthlyIncomeDTO[];
}


/**
 * @swagger
 * components:
 *   schemas:
 *     ClassDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Business
 *         nSeats:
 *           type: integer
 *           example: 24
 *         priceMultiplier:
 *           type: number
 *           format: float
 *           example: 2.5
 *       required:
 *         - id
 *         - name
 *         - nSeats
 *         - priceMultiplier
 */

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

/**
 * @swagger
 * components:
 *   schemas:
 *     AircraftDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         model:
 *           type: string
 *           example: Boeing 737
 *         nSeats:
 *           type: integer
 *           example: 180
 *         classes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassDTO'
 *       required:
 *         - id
 *         - model
 *         - nSeats
 *         - classes
 */
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

/**
 * @swagger
 * components:
 *  schemas:
 *    AircraftInfoDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         model:
 *           type: string
 *           example: Boeing 737-800
 *         nSeats:
 *           type: integer
 *           example: 189
 *         airline:
 *           $ref: '#/components/schemas/AirlineDTO'
 *       required:
 *         - id
 *         - model
 *         - nSeats
 *         - airline
 */
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
