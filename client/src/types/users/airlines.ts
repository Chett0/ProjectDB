interface Airline {
    name : string,
    code : string
}

interface Aircraft {
    model : string,
    nSeats : number
}

interface Airport {
    name : string, 
    code : string,
    city : string,
    country : string
}

interface RouteAirport {
    id : number,
    departure_airport : Airport,
    arrival_airport : Airport
}

interface Route {
    departure_airport_code : string,
    arrival_airport_code : string
}


export type {
    Aircraft, 
    Airline,
    Airport,
    Route,
    RouteAirport
}


