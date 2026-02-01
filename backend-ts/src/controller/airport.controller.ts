import * as airportService from '../services/airport.service';
import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/helpers/response.helper';
import { CityDTO } from '../dtos/airport.dto';
import { asyncHandler } from '../utils/helpers/asyncHandler.helper';

export const getAirportsCities = asyncHandler(
    async(req : Request, res : Response, next : NextFunction) => {
 
        const cities : CityDTO[] = await airportService.getAirportsCities();

        return successResponse<CityDTO[]>(
            res,
            "Cities retrieved successfully", 
            cities, 
            200
        );
    }
);
