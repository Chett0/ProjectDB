import { Response } from '../responses/responses';

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

export interface AircraftInfo {
    model : string,
    nSeats : number
}

export interface Aircraft {
    id: number,
    model: string,
    nSeats: number,
    airline : Airline,
}

export interface Airport {
    id: number,
    name : string, 
    code : string,
    city : string,
    country : string
}

export interface RouteAirport {
    id : number,
    departure_airport : Airport,
    arrival_airport : Airport
}

export interface Route {
    departure_airport_code : string,
    arrival_airport_code : string
}

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

export interface Extra {
    id: number;
    name: string;
    price: number;
}

export interface CreateExtra {
    name: string;
    price: number;
}