import { airports } from '@prisma/client';
import * as airportService from '../services/airport.service';
import { Request, Response, NextFunction } from 'express';
import { errorResponse, successResponse } from '../utils/helpers/response.helper';
import { CitiesDTO } from '../dtos/airport.dto';

export const getAirportsCities = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const cities : CitiesDTO = await airportService.getAirportsCities();
        if(!cities)
            return errorResponse(res, "No cities found", null, 404);
        return successResponse(res, "Cities retrieved successfully", cities, 200);
    }
    catch (error) {
        return errorResponse(res, "Internal server error while retrieving cities");
    }
}
