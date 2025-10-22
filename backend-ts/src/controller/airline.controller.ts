import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlines, airports, routes } from "../../prisma/generated/prisma";
import * as airlineService from "../services/airline.service";
import * as airportService from "../services/airport.service";
import { sendMissingFieldsResponse, sendResponse } from "../utils/helpers/response.helper";
import { AirlineDTO } from "../dtos/user.dto";
import { AirlineRouteDTO } from "../dtos/airline.dto";
import { Route } from "../types/airline.types";
import { toAirportDTO } from "../dtos/airport.dto";


const getAirlineDetails = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            sendMissingFieldsResponse(res);
            return;
        }

        const airline : airlines | null = await airlineService.getAirlineById(airlineId);

        if(!airline){
            sendResponse(res, false, 404, "Airline not found");
            return;
        }

        const airlineResponse : AirlineDTO = {
            id: airline.id,
            name: airline.name,
            code: airline.code
        }

        sendResponse(res, true, 200, "Airline retrieved successfully", airlineResponse);
    }
    catch (error) {
        console.error("Error while retieving airline: ", error);
        sendResponse(res, false, 500, "Internal server error while retrieving airline");
    }
};

const getAirlineRoutes = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            sendMissingFieldsResponse(res);
            return;
        }

        const routes : AirlineRouteDTO[] = await airlineService.getAirlineRoutes(airlineId);

        sendResponse(res, true, 200, "Airline routes retrieved successfully", routes);
    }
    catch (error) {
        console.error("Error while retieving airline routes: ", error);
        sendResponse(res, false, 500, "Internal server error while retrieving airline routes");
    }
};

const createAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const { departureAirportCode, arrivalAirportCode } = req.body; 
        
        if(!airlineId || !departureAirportCode || !arrivalAirportCode){
            sendMissingFieldsResponse(res);
            return;
        }

        const departureAirport : airports | null = await airportService.getAirportByCode(departureAirportCode);
        const arrivalAirport : airports | null = await airportService.getAirportByCode(arrivalAirportCode);

        if(!departureAirport || !arrivalAirport){
            sendResponse(res, false, 404, "Airports not exists");
            return;
        } 

        const route : Route = {
            departureAirportId: departureAirport!.id,
            arrivalAirportId: arrivalAirport!.id
        }

        const newRoute : routes | null = await airlineService.createAirlineRoute(
            airlineId,
            route
        )

        if(!newRoute){
            sendResponse(res, false, 409, "Airline route already registered")
            return;
        }

        const routeResult : AirlineRouteDTO = {
            id: newRoute.id,
            departureAirport: toAirportDTO(departureAirport),
            arrivalAirport: toAirportDTO(arrivalAirport)
        }   

        sendResponse(res, true, 200, "Route created successfully", routeResult);
    }
    catch (error) {
        console.error("Error while creating airline routes: ", error);
        sendResponse(res, false, 500, "Internal server error while creating airline routes");
    }
};


export {
    getAirlineDetails,
    getAirlineRoutes,
    createAirlineRoute
}