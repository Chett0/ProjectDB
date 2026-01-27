import { bookingstate, extras, flights, passengers, seats, seatstate, tickets } from '@prisma/client';
import prisma from "../config/db";
import { ExtraDTO } from "../dtos/airline.dto";
import { FullTicketInfo, PassengerUser, Ticket } from "../types/passenger.types";
import * as flightService from "../services/flight.service"
import { TicketInfoDTO, toTicketInfoDTO } from "../dtos/passenger.dto";
import { PassengerUserDTO, toPassengerUserDTO } from '../dtos/user.dto';
import { connect } from 'http2';

export const getPassengerById = async (
    passengerId : number
) : Promise<PassengerUserDTO> => {
    try{
        const passenger : PassengerUser = await prisma.passengers.findUniqueOrThrow({
            where: {
                id: passengerId
            },
            include : {
                users: true
            }
        });

        return toPassengerUserDTO(passenger);
    } catch(err){
        throw new Error(
            `Failed to retrieving airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const createTicket = async (
    ticket : Ticket,
    extras : ExtraDTO[]  
) : Promise<TicketInfoDTO> => {
    try{ 
        const flight : flights | null = await flightService.getFlightbyId(ticket.flightId);
        if(!flight)
            throw new Error("Flight not found");

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
                    state: seatstate.RESERVED
                }
            }).catch(() => {
                throw new Error("Seat not available");
            });

            let ticketExtras : { extra_id: number }[] = [];
            if(extras.length > 0){
                const extraIds : number[] = extras.map(extra => extra.id);
                const validExtras : extras[] = await tx.extras.findMany({
                    where: {
                        id: { in: extraIds },
                        active: true
                    }
                });

                if (validExtras.length !== extras.length) {
                    throw new Error("One or more extras are unavailable");
                }

                ticketExtras = validExtras.map(extra => ({ extra_id: extra.id }))
            }

            const newTicket : tickets = await prisma.tickets.create({
                data: {
                    flights : {
                        connect : {
                            id: ticket.flightId
                        }
                    },
                    passengers : {
                        connect : {
                            id: ticket.passengerId
                        }
                    },
                    seats : {
                        connect : {
                            id: seat.id
                        }
                    },
                    final_cost: ticket.finalCost,
                    state: bookingstate.PENDING,
                    purchase_date: new Date(),
                    ticket_extra: {
                        create: ticketExtras
                    }
                }
            });

            return newTicket;
        });

        return toTicketInfoDTO(ticketResult, ticket.seatNumber);

    } catch(err){
        throw new Error(
            `Failed to creating ticket: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

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

export const getPassengerTicketById = async (
    passengerId: number,
    ticketId: number
): Promise<tickets | null> => {
    try {
        return await prisma.tickets.findFirst({
            where: {
                id: ticketId,
                passenger_id: passengerId
            }
        });
    } catch (err) {
        throw new Error(
            `Failed to retrieve ticket: ${err instanceof Error ? err.message : "Unknown error"}`
        );
    }
};