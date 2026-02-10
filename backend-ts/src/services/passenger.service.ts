import { bookingstate, extras, flights, seat_holds, seats, seatstate, tickets } from '@prisma/client';
import prisma from "../config/db";
import { ExtraDTO } from "../dtos/airline.dto";
import { FullTicketInfo, PassengerUser, Ticket, UserPassengerInfo } from "../types/passenger.types";
import * as flightService from "../services/flight.service"
import { TicketInfoDTO, toTicketInfoDTO } from "../dtos/passenger.dto";
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

//to do
export const getPassengerTickets = async (
    passengerId: number
): Promise<void> => {
    try {
        const ticketsList : FullTicketInfo[] = await prisma.tickets.findMany({
            where: { 
                passenger_id: passengerId 
            },
            include : {
                seats: {
                    include: {
                        aircraft_classes : true
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
                        routes : {
                            include : {
                                departure_airport: true,
                                arrival_airport: true
                            }
                        }
                    }
                }
            }
        });
        
        //toDo
        //return ticketsList.map();
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

        const seatSession : seat_holds | null = await tx.seat_holds.findFirst({
            where: {
                seat_id: seatId,
                expires_at: {
                    gt: new Date()
                }
            }
        });

        if(seatSession)
            throw new ConflictError("Seat is currently held by another user");

        await tx.seat_holds.create({
            data : {
                user_id: passengerId,
                seat_id: seatId,
                expires_at: new Date(Date.now() + 10 * 60 * 1000) //10 minutes hold
            }
        });
    });
};