import { airports } from '../../prisma/generated/prisma';
import * as airportService from '../services/airports.service';
import { Request, Response, NextFunction } from 'express';

export const createAirport = async(req : Request, res : Response, next : NextFunction) => {
    try{
        const airport : airports = req.body;
        const newAirport = await airportService.createAirport(airport);
        res.status(201).json(newAirport);
    }
    catch (error) {
        next(error); // Pass to error-handling middleware
    }
}
