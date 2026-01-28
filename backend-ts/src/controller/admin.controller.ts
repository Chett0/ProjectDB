import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { errorResponse, missingFieldsResponse, successResponse } from "../utils/helpers/response.helper";
import * as adminService from "../services/admin.service"
import { AdminDashboardDTO } from "../dtos/admin.dtos";
import { AirlineDTO } from "../dtos/user.dto";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { UnauthorizedError } from "../utils/errors";


export const getAdminDashboardStats = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const adminId : number | null = req.user!.id;
        if(!adminId)
            throw new UnauthorizedError();

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

        return successResponse<AdminDashboardDTO>(
            res, 
            "DashBoard stats retrieved successfully", 
            dashBoard
        );
    }
);


export const getAllAirlines = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const adminId : number | null = req.user!.id;
        if(!adminId)
            throw new UnauthorizedError();

        const airlines : AirlineDTO[] = await adminService.getAllAirlines();

        return successResponse<AirlineDTO[]>(
            res, 
            "Airlines retrieved successfully", 
            airlines
        );
    }
);