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
        if(!name && !surname)
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
        
        if(!flightId || finalCost == null || !seatNumber)
            throw new BadRequestError();


        const ticket : Ticket = {
            flightId: flightId,
            passengerId: passengerId,
            seatNumber: seatNumber,
            finalCost: finalCost,
            state: BookingState.PENDING,
            purchaseDate : new Date()
        };

        const newTicket : TicketInfoDTO  = await passengerService.createTicket(ticket, extrasIds);

        return successResponse<TicketInfoDTO>(
            res, 
            "Ticket created successfully", 
            newTicket, 
            201
        );
    }
);


export const getPassengerTickets = asyncHandler(
     async (req: AuthenticatedRequest, res: Response): Promise<Response> => {

        const passengerId: number | null = req.user!.id;
        if (!passengerId) 
            throw new UnauthorizedError();

        const page: number = parseInt((req.query.page as string) || '1') || 1;
        const limit: number = parseInt((req.query.limit as string) || '10') || 10;
        const state: string | undefined = req.query.state as string | undefined;
        const flightIdParam: string | undefined = req.query.flightId as string | undefined;
        const flightId: number | undefined = flightIdParam ? parseInt(flightIdParam) : undefined;

        const filtersObj: { state?: string; flightId?: number } = {};
        if (state) filtersObj.state = state;
        if (flightId !== undefined) filtersObj.flightId = flightId;
        const filtersParam = Object.keys(filtersObj).length ? filtersObj : undefined;

        const { tickets, total } = await passengerService.getPassengerTickets(passengerId, page, limit, filtersParam);

        return successResponse<any>(
            res,
            "Tickets retrieved successfully",
            { tickets, total, page, limit }
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


export const createSeatSession = asyncHandler(
     async (req: AuthenticatedRequest, res: Response): Promise<Response> => {

        const passengerId: number | null = req.user!.id;
        const paramsSeatId: string | undefined = req.params.seatId;

        if(!passengerId)
            throw new UnauthorizedError("Passenger ID is required");
        if (!paramsSeatId)
            throw new BadRequestError("Seat ID is required");

        const seatId : number = parseInt(paramsSeatId);
        if(isNaN(seatId))
            throw new BadRequestError("Seat ID must be a valid number");

        await passengerService.createSeatSession(passengerId, seatId);

        return successResponse<void>(
            res,
            "Seat session created successfully"
        );
});