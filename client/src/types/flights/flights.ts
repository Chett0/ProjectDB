import { Expansion } from "@angular/compiler"
import { Airport } from "../airports/airports"
import { AircraftWithAirline, Class, Extra } from "../users/airlines"
import { PassengerInfo } from "../users/passenger"

export enum SeatState {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  BOOKED = "BOOKED"
}

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
    class : Class
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
    flights: Flight[],
    totalDuration: number,
    totalPrice: number
}

export interface Filters {
  maxPrice: number,
  nStops: number;
  sortBy: 'total_price' | 'total_duration' | 'departure_time' | 'arrival_time';
  order: 'asc' | 'desc';
}


export interface CreateTicket {
    flightId: number,
    finalCost: number,
    extrasIds: number[],
    seatNumber: string,
}

export interface TicketInfo {
    id: number;
    seatNumber: string;
    finalCost: number | string;
}

export interface TicketDisplay {
    id: number;
    code: string;
    airline: string;
    booking: number | string;
    from: {
        code: string;
        city: string;
        time: string;
        date: string;
    };
    to: {
        code: string;
        city: string;
        time: string;
        date: string;
    };
    cabin: string;
    seat: string;
    price: string | number;
    raw?: any;
}