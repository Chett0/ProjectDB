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




