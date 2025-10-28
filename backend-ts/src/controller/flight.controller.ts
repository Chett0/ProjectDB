import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlineRoute, airlines, airports, extras, flights, routes } from "../../prisma/generated/prisma";
import * as flightService from "../services/flight.service";
import * as airportService from "../services/airport.service";
import { AirlineDTO } from "../dtos/user.dto";
import { AirlineRouteDTO, DashBoardDTO, ExtraDTO } from "../dtos/airline.dto";
import { Extra, Route } from "../types/airline.types";
import { SearchFlightsParams, Sort } from "../types/flight.types";
import { errorResponse, missingFieldsResponse, successResponse } from "../utils/helpers/response.helper";
import { JourneysInfoDTO } from "../dtos/flight.dto";



const searchFlight = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
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

export {
    searchFlight
}