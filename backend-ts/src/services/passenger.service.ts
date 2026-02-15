import { bookingstate, extras, flights, seats, seatstate, tickets } from '@prisma/client';
import prisma from "../config/db";
import { ExtraDTO } from "../dtos/airline.dto";
import { FullTicketInfo, PassengerUser, Ticket, UserPassengerInfo } from "../types/passenger.types";
import * as flightService from "../services/flight.service"
import { TicketInfoDTO, toTicketInfoDTO, TicketDisplayDTO, toTicketDisplayDTO, PassengerStatsDTO } from "../dtos/passenger.dto";
import { PassengerUserDTO, toPassengerUserDTO } from '../dtos/user.dto';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

export const updatePassenger = async (
    passengerId : number,
    passengerData : Partial<UserPassengerInfo>
) : Promise<PassengerUserDTO> => {
    
    const existing = await prisma.passengers.findUnique({
        where: { id: passengerId },
        include: { users: true }
    });

    if(!existing || !existing.users || !existing.users.active)
        throw new Error("Passenger or associated user not found/active");

    const dataToUpdate: any = {};
    if (passengerData.name !== undefined) dataToUpdate.name = passengerData.name;
    if (passengerData.surname !== undefined) dataToUpdate.surname = passengerData.surname;

    const updatedPassenger = await prisma.passengers.update({
        where: { id: passengerId },
        include: { users: true },
        data: dataToUpdate
    });

    return toPassengerUserDTO(updatedPassenger as PassengerUser);
}

export const getPassengerById = async (
    passengerId : number
) : Promise<PassengerUserDTO> => {
    const passenger : PassengerUser = await prisma.passengers.findUniqueOrThrow({
        where: {
            id: passengerId
        },
        include : {
            users: true
        }
    });

    return toPassengerUserDTO(passenger);
};


export const createTicket = async (
    ticket : Ticket,
    extraIds : number[]  
) : Promise<TicketInfoDTO> => { 

    const ticketResult : tickets = await prisma.$transaction(async(tx) => {

        const seat : seats = await tx.seats.update({
            where: {
                flight_id_number: {
                    flight_id: ticket.flightId,
                    number: ticket.seatNumber,
                },
                state : seatstate.AVAILABLE
            },
            data : {
                state: seatstate.BOOKED
            }
        });

        if(extraIds.length > 0){

            const validExtras : extras[] = await tx.extras.findMany({
                where: {
                    id: { 
                        in: extraIds 
                    },
                    active: true
                }
            });

            if (validExtras.length !== extraIds.length) 
                throw new NotFoundError("One or more extras are unavailable");

        }

        const newTicket : tickets = await prisma.tickets.create({
            data: {
                flight_id: ticket.flightId,
                passenger_id: ticket.passengerId,
                seat_id: seat.id,
                final_cost: ticket.finalCost,
                state: bookingstate.CONFIRMED,
                purchase_date: new Date(),
                ticket_extra: {
                    createMany: {
                        data: extraIds.map(extraId => ({
                            extra_id: extraId
                        }))
                    }
                }
            }
        });

        return newTicket;
    });

    return toTicketInfoDTO(ticketResult, ticket.seatNumber);

};

export const getPassengerTickets = async (
    passengerId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { state?: string; flightId?: number }
): Promise<{ tickets: TicketDisplayDTO[]; total: number; page: number; limit: number }> => {
    try {
        const whereClause: any = { passenger_id: passengerId };
        if (filters) {
            if (filters.state) whereClause.state = filters.state;
            if (filters.flightId) whereClause.flight_id = filters.flightId;
        }

        const total: number = await prisma.tickets.count({ where: whereClause });

        const ticketsList: FullTicketInfo[] = await prisma.tickets.findMany({
            where: whereClause,
            include: {
                seats: {
                    include: {
                        aircraft_classes: true
                    }
                },
                ticket_extra: {
                    include: {
                        extras: true
                    }
                },
                flights: {
                    include: {
                        aircrafts: {
                            include: {
                                airlines: true
                            }
                        },
                        routes: {
                            include: {
                                departure_airport: true,
                                arrival_airport: true
                            }
                        }
                    }
                }
            },
            orderBy: { purchase_date: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const ticketsDisplay: TicketDisplayDTO[] = ticketsList.map(t => toTicketDisplayDTO(t));

        return { tickets: ticketsDisplay, total, page, limit };
    } catch (err) {
        throw new Error(
            `Failed to retrieve tickets: ${err instanceof Error ? err.message : "Unknown error"}`
        );
    }
};

//to do
export const getPassengerTicketById =  async (
    passengerId: number,
    ticketId: number
): Promise<tickets> => {
        
    const ticket : tickets | null = await prisma.tickets.findFirst({
        where: {
            id: ticketId,
            passenger_id: passengerId
        }
    });

    if(!ticket)
        throw new NotFoundError("Ticket not found");

    return ticket;
};

export const createSeatSession =  async (
    passengerId: number,
    seatId: number
): Promise<void> => {

    await prisma.$transaction(async (tx) => {

        const seatSession : any = await (tx as any).seat_holds.findFirst({
            where: {
                seat_id: seatId,
                expires_at: {
                    gt: new Date()
                }
            }
        });

        if(seatSession)
            throw new ConflictError("Seat is currently held by another user");

        await (tx as any).seat_holds.create({
            data : {
                user_id: passengerId,
                seat_id: seatId,
                expires_at: new Date(Date.now() + 10 * 60 * 1000) //10 minutes hold
            }
        });
    });
};

export const getPassengerStats = async (
    passengerId: number
): Promise<PassengerStatsDTO> => {
    const ticketsList = await prisma.tickets.findMany({
        where: {
            passenger_id: passengerId,
            state: bookingstate.CONFIRMED
        },
        include: {
            flights: true
        }
    });

    const uniqueFlights = new Map<number, number>();
    let moneySpent = 0;

    for (const t of ticketsList) {
        try {
            moneySpent += typeof t.final_cost.toNumber === 'function' ? t.final_cost.toNumber() : Number(t.final_cost);
        } catch (e) {
            moneySpent += Number(t.final_cost as any) || 0;
        }

        if (t.flight_id && t.flights && typeof t.flights.duration_seconds === 'number') {
            if (!uniqueFlights.has(t.flight_id)) uniqueFlights.set(t.flight_id, t.flights.duration_seconds);
        }
    }

    const totalFlights = uniqueFlights.size;
    const totalSeconds = Array.from(uniqueFlights.values()).reduce((acc, v) => acc + v, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { totalFlights, flightHours: { hours, minutes }, moneySpent: Math.round(moneySpent * 100) / 100 };
};