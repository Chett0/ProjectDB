import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { passengers } from '@prisma/client';
import { PassengerDTO, PassengerUserDTO } from "../dtos/user.dto";
import * as passengerService from "./../services/passenger.service";
import { BookingState, Ticket } from "../types/passenger.types";
import { TicketInfoDTO } from "../dtos/passenger.dto";


const getPassengerDetails = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const passengerId : number | null = req.user!.id;
        
        if(!passengerId){
            return missingFieldsResponse(res);
        }

        const passenger : PassengerUserDTO = await passengerService.getPassengerById(passengerId);

        return successResponse(res, "Passenger retrieved successfully", passenger);
    }
    catch (error) {
        return errorResponse(res, "Internal server error while retrieving passenger");
    }
};


const createTicket = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const passengerId : number | null = req.user!.id;
        const {flightId, finalCost, extrasIds, seatNumber} = req.body; 
        
        if(!passengerId || !flightId || !finalCost || !seatNumber){
            return missingFieldsResponse(res);
        }

        const ticket : Ticket = {
            flightId: flightId,
            passengerId: passengerId,
            seatNumber: seatNumber,
            finalCost: finalCost,
            state: BookingState.PENDING,
            purchaseDate : new Date()
        }

        const newTicket : TicketInfoDTO  = await passengerService.createTicket(ticket, extrasIds);

        return successResponse(res, "Ticket created successfully", newTicket, 201);
    }
    catch (error) {
        console.error("Error while creating ticket: ", error);
        return errorResponse(res, "Internal server error while creating ticket");
    }
};


const getPassengerTickets = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const passengerId: number | null = req.user!.id;
        if (!passengerId) {
            return missingFieldsResponse(res);
        }

        await passengerService.getPassengerTickets(passengerId);
        return successResponse(res, "Tickets retrieved successfully");
    } catch (error) {
        console.error("Error while retrieving tickets: ", error);
        return errorResponse(res, "Internal error retrieving tickets");
    }
};

const getPassengerTicketById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const passengerId: number | null = req.user!.id;
        const paramsTicketId: string | undefined = req.params.ticketId;
        if (!passengerId || !paramsTicketId) {
            return missingFieldsResponse(res);
        }
        const ticketId = parseInt(paramsTicketId);
        const ticket = await passengerService.getPassengerTicketById(passengerId, ticketId);
        if (!ticket) {
            return notFoundResponse(res, "Ticket not found");
        }
        return successResponse(res, "Ticket retrieved successfully", ticket);
    } catch (error) {
        console.error("Error while retrieving ticket: ", error);
        return errorResponse(res, "Internal error retrieving ticket");
    }
};

export {
    getPassengerDetails,
    createTicket,
    getPassengerTickets,
    getPassengerTicketById
}