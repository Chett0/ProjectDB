import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlines } from "../../prisma/generated/prisma";
import { getAirlineById } from "../services/airline.service";


const getAirlineDetails = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            res.status(400).json({
                message: "Missing required fields",
                success: false
            });
            return;
        }

        const airline : airlines | null = await getAirlineById(airlineId);

        if(!airline){
            res.status(404).json({
                message: "Not found",
                success: false
            });
            return;
        }

        // res.status(201).json({
        //     message: "Airline retrieved successfully",
        //     data: toAirlineDTO(airline)
        // })
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error while retrieving airline",
            success: false
        })
    }
};


export {
    getAirlineDetails
}