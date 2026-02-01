import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import * as flightService from "../services/flight.service";
import { Flight, SearchFlightsParams } from "../types/flight.types";
import { successResponse } from "../utils/helpers/response.helper";
import { JourneysInfoDTO, SeatsDTO } from "../dtos/flight.dto";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { BadRequestError } from "../utils/errors";

export const createFlight = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const {routeId, aircraftId, departureTime, arrivalTime, basePrice} = req.body;
        const airlineId : number | null = req.user!.id;
        
        if(!routeId || !aircraftId || !airlineId || !departureTime || !arrivalTime || !basePrice)
            throw new BadRequestError("Missing required fields");

        const flight : Flight = {
            airlineId: airlineId,
            routeId : Number(routeId),
            aircraftId : Number(aircraftId),
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            basePrice: Number(basePrice),
            durationSeconds: (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) / 1000
        };

        await flightService.createFlight(flight);

        return successResponse<void>(
            res, 
            "Flight created successfully"
        );
    }
);



export const searchFlights = asyncHandler(
     async(req : Request, res : Response): Promise<Response> => {

        const sortBy : string = (req.query.sort_by as string) || 'total_duration';
        const order : string = ((req.query.order as string) || 'asc').toLowerCase();
        const departureAirportCity : string | undefined = req.query.from as string;
        const arrivalAirportCity : string | undefined = req.query.to as string;
        const nStops : number = parseInt(req.query.n_stops as string);
        const departureDate : string | undefined = req.query.departure_date as string;
        const maxPrice : number = parseInt(req.query.max_price as string) || 2000; 
        
        if(!departureAirportCity || !arrivalAirportCity || !departureDate)
            throw new BadRequestError("Missing required query parameters");

        const params : SearchFlightsParams = {
            sort: {
                sortBy: sortBy,
                order: order
            },
            departureAirportCity: departureAirportCity,
            arrivalAirportCity: arrivalAirportCity,
            nStops: nStops,
            departureDate: departureDate,
            maxPrice: maxPrice
        }

        const journeys : JourneysInfoDTO[] = await flightService.searchFlights(params);

        return successResponse<JourneysInfoDTO[]>(
            res, 
            "Flight retrieved successfully", 
            journeys
        );
    }
);


export const getFlightSeats = asyncHandler(
     async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const flightId : number | null = parseInt(req.params.flightId as string) || null; 
        if(!flightId)
            throw new BadRequestError("Flight ID must be a valid number");

        const seats : SeatsDTO[] = await flightService.getFlightSeats(flightId);

        return successResponse<SeatsDTO[]>(
            res, 
            "Seats retrieved successfully", 
            seats
        );
    }
);
