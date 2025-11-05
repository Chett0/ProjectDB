import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import * as flightService from "../services/flight.service";
import * as airlineService from "../services/airline.service";
import { Flight, SearchFlightsParams, Sort } from "../types/flight.types";
import { errorResponse, missingFieldsResponse, successResponse } from "../utils/helpers/response.helper";
import { JourneysInfoDTO, SeatsDTO } from "../dtos/flight.dto";
import { aircraft_classes, aircrafts, airlineRoute } from '@prisma/client';
import { AircraftDTO, AirlineRouteDTO, ClassDTO } from "../dtos/airline.dto";

const createFlight = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        
        const {routeId, aircraftId, departureTime, arrivalTime, basePrice} = req.body;
        const airlineId : number | null = req.user!.id;
        
        if(!routeId || !aircraftId || !airlineId || !departureTime || !arrivalTime || !basePrice){
            return missingFieldsResponse(res);
        }

        const aircraftClasses : ClassDTO[] | null = await airlineService.getAircraftClasses(airlineId, aircraftId);
        if(!aircraftClasses){
            return errorResponse(res, "Aircraft not found", null, 404);
        }

        const route : AirlineRouteDTO | null = await airlineService.getAirlineRouteById(airlineId, routeId);
        if(!route){
            return errorResponse(res, "Route not found", null, 404);
        }

        const flight : Flight = {
            routeId : routeId,
            aircraftId : aircraftId,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            basePrice: basePrice,
            durationSeconds: (arrivalTime - departureTime)
        }

        await flightService.createFlight(flight, aircraftClasses);

        return successResponse(res, "Flight created successfully");
    }
    catch (error) {
        console.error("Error while creating flights: ", error);
        return errorResponse(res, "Internal server error while creating flights");
    }
};



const searchFlights = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const pageNumber : number = parseInt(req.query.page as string) || 1;
        const limit : number = parseInt(req.query.limit as string) || 10;
        const sortBy : string = (req.query.sort_by as string) || 'total_duration';
        const order : string = ((req.query.order as string) || 'asc').toLowerCase();
        const departureAirportCity : string | undefined = req.query.from as string;
        const arrivalAirportCity : string | undefined = req.query.to as string;
        const layovers : number = parseInt(req.query.max_layovers as string) || 1;
        const departureDate : string | undefined = req.query.departure_date as string;
        const maxPrice : number = parseInt(req.query.max_price as string) || 2000; 

        const sort : Sort = {
            sortBy: sortBy,
            order: order
        }
        
        if(!departureAirportCity || !arrivalAirportCity || !departureDate){
            return missingFieldsResponse(res);
        }

        const params : SearchFlightsParams = {
            sort: sort,
            departureAiportCity: departureAirportCity,
            arrivalAirportCity: arrivalAirportCity,
            layovers: layovers,
            departureDate: departureDate,
            maxPrice: maxPrice
        }

        const journeys : JourneysInfoDTO[] = await flightService.searchFlights(params);

        return successResponse(res, "Flight retrieved successfully", journeys);
    }
    catch (error) {
        console.error("Error while retrieving flights: ", error);
        return errorResponse(res, "Internal server error while retrieving flights");
    }
};


const getFlightSeats = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const flightId : number | null = parseInt(req.params.flightId as string) || null; 
        if(!flightId)
            return missingFieldsResponse(res);

        const seats : SeatsDTO[] = await flightService.getFlightSeats(flightId);

        return successResponse(res, "Seats retrieved successfully", seats);
    }
    catch (error) {
        console.error("Error while retrieving seats: ", error);
        return errorResponse(res, "Internal server error while retrieving seats");
    }
};

export {
    searchFlights,
    getFlightSeats,
    createFlight
}