import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { passengers } from "../../prisma/generated/prisma";
import { PassengerDTO } from "../dtos/user.dto";
import * as passengerService from "./../services/passenger.service";


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

export {
    getPassengerDetails
}