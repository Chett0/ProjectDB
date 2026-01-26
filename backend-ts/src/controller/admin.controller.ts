import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { errorResponse, missingFieldsResponse, successResponse } from "../utils/helpers/response.helper";
import * as adminService from "../services/admin.service"
import { AdminDashboardDTO } from "../dtos/admin.dtos";
import { AirlineDTO } from "../dtos/user.dto";


export const getAdminDashboardStats = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const adminId : number | null = req.user!.id;
        
        if(!adminId){
            return missingFieldsResponse(res);
        }

        const passengersCount : number = await adminService.getActivePassengersCount();
        const airlinesCount : number = await adminService.getActiveAirlinesCount();
        const flightsCount : number = await adminService.getActiveFlights();
        const routesCount : number = await adminService.getActiveRoutes();


        const dashBoard : AdminDashboardDTO = {
            passengersCount: passengersCount,
            airlinesCount: airlinesCount,
            flightsCount: flightsCount,
            activeRoutesCount: routesCount
        }

        return successResponse(res, "DashBoard stats retrieved successfully", dashBoard);
    }
    catch (error) {
        console.error("Error while retrieving admin dashboard stats: ", error);
        return errorResponse(res, "Internal server error while retrieving admin dashboard stats");
    }
};


export const getAllAirlines = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const adminId : number | null = req.user!.id;
        
        if(!adminId){
            return missingFieldsResponse(res);
        }

        const airlines : AirlineDTO[] = await adminService.getAllAirlines();

        return successResponse(res, "Airlines retrieved successfully", airlines);
    }
    catch (error) {
        console.error("Error while retrieving airlines: ", error);
        return errorResponse(res, "Internal server error while retrieving airlines");
    }
};