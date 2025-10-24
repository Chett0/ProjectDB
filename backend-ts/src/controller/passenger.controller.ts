import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { setMissingFieldsResponse, setResponse } from "../utils/helpers/response.helper";
import { passengers } from "../../prisma/generated/prisma";
import { PassengerDTO } from "../dtos/user.dto";
import * as passengerService from "./../services/passenger.service";


const getPassengerDetails = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const passengerId : number | null = req.user!.id;
        
        if(!passengerId){
            setMissingFieldsResponse(res);
            return;
        }

        const passenger : passengers | null = await passengerService.getPassengerById(passengerId);

        if(!passenger){
            setResponse(res, false, 404, "Passenger not found");
            return;
        }

        const passengerResponse : PassengerDTO = {
            id: passenger.id,
            name: passenger.name,
            surname: passenger.surname
        }

        setResponse(res, true, 200, "Passenger retrieved successfully", passengerResponse);
    }
    catch (error) {
        console.error("Error while retieving passenger: ", error);
        setResponse(res, false, 500, "Internal server error while retrieving passenger");
    }
};

export {
    getPassengerDetails
}