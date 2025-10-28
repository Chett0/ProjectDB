import { bookingstate, extras, flights, passengers, seats, seatstate, tickets } from "../../prisma/generated/prisma";
import prisma from "../config/db";
import { ExtraDTO } from "../dtos/airline.dto";
import { Ticket } from "../types/passenger.types";
import * as flightService from "../services/flight.service"
import { TicketInfoDTO } from "../dtos/passenger.dto";

const getPassengerById = async (
    passengerId : number
) : Promise<passengers | null> => {
    try{
        const passenger : passengers | null = await prisma.passengers.findUnique({
            where: {
                id: passengerId
            }
        })

        return passenger;
    } catch(err){
        throw new Error(
            `Failed to retrieving airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const createTicket = async (
    ticket : Ticket,
    extras : ExtraDTO[] | null  
) : Promise<TicketInfoDTO | null> => {
    try{ 
        const flight : flights | null = await flightService.getFlightbyId(ticket.flightId);
        if(!flight)
            return null;

        const ticketResult : tickets | null = await prisma.$transaction(async(tx) => {

            const seat : seats | null = await tx.seats.findUnique({
                where: {
                    flight_id_number: {
                        flight_id: ticket.flightId,
                        number: ticket.seatNumber,
                    },
                }
            });

            if(!seat || seat.state != seatstate.AVAILABLE)
                throw new Error("Seat not available");

            const newTicket : tickets | null = await prisma.tickets.create({
                data: {
                    flight_id: ticket.flightId,
                    passenger_id: ticket.passengerId,
                    seat_id: seat.id,
                    final_cost: ticket.finalCost,
                    state: bookingstate.PENDING,
                    purchase_date: new Date()
                }
            });

            await prisma.seats.update({
                where:{
                    id: seat.id
                },
                data: {
                    state: seatstate.RESERVED
                }
            });

            if(extras){
                for(const extra  of extras){
                    const existingExtra : extras | null = await prisma.extras.findUnique({
                        where: {
                            id: extra.id,
                            active: true
                        }
                    });

                    if(!existingExtra)
                        throw new Error("Extra not available");

                    await prisma.ticket_extra.create({
                        data:{
                            extra_id: extra.id,
                            ticket_id: newTicket.id
                        }
                    });
                }
            }

            return newTicket;
        });

        if(!ticketResult)
            return null;

        return TicketInfoDTO.fromPrisma(ticketResult, ticket.seatNumber);

    } catch(err){
        throw new Error(
            `Failed to creating ticket: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    getPassengerById,
    createTicket
}