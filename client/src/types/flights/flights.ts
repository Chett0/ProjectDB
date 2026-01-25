import { Aircraft, Airport } from "../users/airlines"

export interface FlightSeat {
    id: number, 
    departure_time: string,
    arrival_time: string
}

export interface AircraftClassSeat {
    id: number,
    name: string,
    price_multiplier: number
}

export interface Seat {
    id: number,
    number: string,
    state: string,
    price: number,
    flight: FlightSeat,
    aircraft_class: AircraftClassSeat
}

export interface Flight {
    id: number,
    departureTime: Date,
    arrivalTime: Date,
    basePrice: number,
    aircraft : Aircraft,
    departureAirport: Airport,
    arrivalAirport: Airport
}

export interface Journeys {
    firstFlight: Flight,
    secondFlight: Flight | null,
    totalDuration: number,
    totalPrice: number
}