import { Airport } from '../airports/airports';
import { Response } from '../responses/responses';

// User

export interface Airline {
    id: number,
    name : string,
    code : string
}

export interface AirlineAsUser {
    email: string,
    code: string,
    name: string
}

// Aircrafts

export interface AircraftInfo {
    model : string,
    nSeats : number
}

export interface CreateAircraft extends AircraftInfo {  
    classes : ClassInfo[];
}

export interface Aircraft {
    id: number,
    model: string,
    nSeats: number,
}

export interface AircraftWithAirline extends Aircraft {
    airline : Airline
}

export interface AircraftWithClasses extends AircraftWithAirline {
    classes: Class[];
}

export interface Class {
    id: number;
    name: string;
    nSeats: number;
    priceMultiplier: number;
}

export interface ClassInfo {
    name: string;
    nSeats: number;
    priceMultiplier: number;
}

// Routes


export interface AirlineRoute {
    id : number,
    departureAirport : Airport,
    arrivalAirport : Airport
}

export interface Route {
    departureAirportCode : string,
    arrivalAirportCode : string
}

// Extra 

export interface Extra {
    id: number;
    name: string;
    price: number;
}

export interface CreateExtra {
    name: string;
    price: number;
}

//Dashboard

export interface RoutesMostInDemand {
    departureAirport: Airport;
    arrivalAirport: Airport;
    passengerCount: number;
}

export interface MonthlyIncome {
    month: string;
    income: number;
}

export interface AirlineDashBoard {
    passengerCount: number;
    monthlyIncome: number;
    activeRoutes: number;
    flightsInProgress: number;
    routesMostInDemand: RoutesMostInDemand[];
    monthlyIncomes : MonthlyIncome[];
}


export interface AirlineResolverResponse {
    dashboardStatsResponse: Response<AirlineDashBoard>;
}
