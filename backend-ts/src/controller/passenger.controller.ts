import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { successResponse } from "../utils/helpers/response.helper";
import { PassengerUserDTO } from "../dtos/user.dto";
import * as passengerService from "./../services/passenger.service";
import { BookingState, Ticket, UserPassengerInfo } from "../types/passenger.types";
import { TicketInfoDTO } from "../dtos/passenger.dto";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

export const updatePassenger = asyncHandler (
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
        const passengerId : number | null = req.user!.id;
        if(!passengerId)
            throw new UnauthorizedError();

        const { name, surname } = req.body;
        if(name === undefined && surname === undefined)
            throw new BadRequestError("At least one field (name, surname) must be provided for update");

        const passengerUpdateInfo : Partial<UserPassengerInfo> = {
            name: name,
            surname: surname
        }

        const updatedPassenger : PassengerUserDTO = await passengerService.updatePassenger(
            passengerId, 
            passengerUpdateInfo
        );

        return successResponse<PassengerUserDTO>(
            res,
            "Passenger updated successfully",
            updatedPassenger
        );
    }
);

export const getPassengerDetails = asyncHandler (
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
        const passengerId : number | null = req.user!.id;
        
        if(!passengerId)
            throw new UnauthorizedError()

        const passenger : PassengerUserDTO = await passengerService.getPassengerById(passengerId);

        return successResponse<PassengerUserDTO>(
            res, 
            "Passenger retrieved successfully", 
            passenger
        );
    }
);


export const createTicket = asyncHandler(
     async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const passengerId : number | null = req.user!.id;
        const {flightId, finalCost, extrasIds, seatNumber} = req.body; 

        if(!passengerId)
            throw new UnauthorizedError();
        
        if(!flightId || !finalCost || !seatNumber)
            throw new BadRequestError();


        const ticket : Ticket = {
            flightId: flightId,
            passengerId: passengerId,
            seatNumber: seatNumber,
            finalCost: finalCost,
            state: BookingState.PENDING,
            purchaseDate : new Date()
        }

        const newTicket : TicketInfoDTO  = await passengerService.createTicket(ticket, extrasIds);

        return successResponse<TicketInfoDTO>(
            res, 
            "Ticket created successfully", 
            newTicket, 
            201
        );
    }
);

//to do
export const getPassengerTickets = asyncHandler(
     async (req: AuthenticatedRequest, res: Response): Promise<Response> => {

        const passengerId: number | null = req.user!.id;
        if (!passengerId) 
            throw new UnauthorizedError();

        await passengerService.getPassengerTickets(passengerId);

        return successResponse<void>(
            res, 
            "Tickets retrieved successfully"
        );
});

//to do
export const getPassengerTicketById = asyncHandler(
     async (req: AuthenticatedRequest, res: Response): Promise<Response> => {

        const passengerId: number | null = req.user!.id;
        const paramsTicketId: string | undefined = req.params.ticketId;

        if(!passengerId)
            throw new UnauthorizedError("Passenger ID is required");
        if (!paramsTicketId)
            throw new BadRequestError("Ticket ID is required");

        const ticketId : number = parseInt(paramsTicketId);
        if(isNaN(ticketId))
            throw new BadRequestError("Ticket ID must be a valid number");

        const ticket = await passengerService.getPassengerTicketById(passengerId, ticketId);

        return successResponse<void>(
            res,
            "Ticket retrieved successfully"
        );
});