import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { passengers } from "../../prisma/generated/prisma";
import { PassengerDTO } from "../dtos/user.dto";
import * as passengerService from "./../services/passenger.service";
import { BookingState, Ticket } from "../types/passenger.types";
import { TicketInfoDTO } from "../dtos/passenger.dto";


const getPassengerDetails = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const passengerId : number | null = req.user!.id;
        
        if(!passengerId){
            return missingFieldsResponse(res);
        }

        const passenger : passengers | null = await passengerService.getPassengerById(passengerId);

        if(!passenger){
            return notFoundResponse(res, "Passenger not found");
        }

        const passengerResponse : PassengerDTO = {
            id: passenger.id,
            name: passenger.name,
            surname: passenger.surname
        }

        return successResponse(res, "Passenger retrieved successfully", passengerResponse);
    }
    catch (error) {
        console.error("Error while retieving passenger: ", error);
        return errorResponse(res, "Internal server error while retrieving passenger");
    }
};


const createTicket = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const passengerId : number | null = req.user!.id;
        const {flightId, finalCost, extras, seatNumber} = req.body; 
        
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

        const newTicket : TicketInfoDTO | null = await passengerService.createTicket(ticket, extras);
        if(!newTicket){
            return errorResponse(res, "Ticket not created", null, 409);
        }

        return successResponse(res, "Ticket created successfully", newTicket, 201);
    }
    catch (error) {
        console.error("Error while creating ticket: ", error);
        return errorResponse(res, "Internal server error while creating ticket");
    }
};


export {
    getPassengerDetails,
    createTicket
}