import { Expansion } from "@angular/compiler"
import { Airport } from "../airports/airports"
import { AircraftWithAirline, Class, Extra } from "../users/airlines"

export interface FlightSeat {
    id: number, 
    departureTime: string,
    arrivalTime: string
}

export interface Seat extends SeatInfo {
    flight: FlightSeat
}

export interface SeatInfo {
    id: number,
    number: string,
    state: string,
    price: number,
    aircraftClass : Class
}

export interface Flight {
    id: number,
    departureTime: Date,
    arrivalTime: Date,
    basePrice: number,
    aircraft : AircraftWithAirline,
    departureAirport: Airport,
    arrivalAirport: Airport
}

export interface CreateFlight {
    routeId: number;
    aircraftId: number;
    departureTime: string;
    arrivalTime: string;
    basePrice: number;
}

export interface Journeys {
    firstFlight: Flight,
    secondFlight: Flight | null,
    totalDuration: number,
    totalPrice: number
}

export interface TicketFlightData {
    flight: Flight,
    seats: SeatInfo[],
    classes: Class[];
    extras: Extra[];
    selectedSeat: SeatInfo | null;
    selectedClass: string;
    selectedExtras: number[];
    final_cost: number;
}

export interface Filters {
  maxPrice: number,
  nStop: number;
  sortBy: 'total_price' | 'total_duration' | 'departure_time' | 'arrival_time';
  order: 'asc' | 'desc';
}


export interface CreateTicket {
    flightId: number,
    finalCost: number,
    extrasIds: number[],
    seatNumber: string,
}