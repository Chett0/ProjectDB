import { Decimal } from "@prisma/client/runtime/library";
import { tickets } from '@prisma/client';

export interface TicketInfoDTO {
    id: number;
    seatNumber: string;
    finalCost: Decimal;
}

export const toTicketInfoDTO = (ticket: tickets, seatNumber: string): TicketInfoDTO => ({
    id: ticket.id,
    seatNumber: seatNumber,
    finalCost: ticket.final_cost,
})



export interface TicketDisplayDTO {
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

export const toTicketDisplayDTO = (ticket: any): TicketDisplayDTO => {
    const flight = ticket.flights || {};
    const route = flight.routes || {};
    const depAirport = route.departure_airport || {};
    const arrAirport = route.arrival_airport || {};
    const aircraft = flight.aircrafts || {};
    const airline = aircraft.airlines || {};
    const seat = ticket.seats || {};

    const departureTime = flight.departure_time ? new Date(flight.departure_time) : null;
    const arrivalTime = flight.arrival_time ? new Date(flight.arrival_time) : null;

    const formatTime = (d: Date | null) => d ? d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (d: Date | null) => d ? d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return {
        id: ticket.id,
        code: `F${flight.id || ''}`,
        airline: airline.name || '',
        booking: ticket.id,
        from: {
            code: depAirport.iata || depAirport.code || '',
            city: depAirport.city || '',
            time: formatTime(departureTime),
            date: formatDate(departureTime)
        },
        to: {
            code: arrAirport.iata || arrAirport.code || '',
            city: arrAirport.city || '',
            time: formatTime(arrivalTime),
            date: formatDate(arrivalTime)
        },
        cabin: seat.aircraft_classes?.name || '',
        seat: seat.number || '',
        price: (ticket.final_cost !== undefined && ticket.final_cost !== null) ? ticket.final_cost : '',
        raw: ticket
    };
}

// }