import * as airportService from '../services/airports.service';
import { Request, Response, NextFunction } from 'express';

export const createAirport = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const airport = await airportService.createAirport(req.body);
        res.status(201).json(airport);
    }
    catch (error) {
        next(error); // Pass to error-handling middleware
    }
}
