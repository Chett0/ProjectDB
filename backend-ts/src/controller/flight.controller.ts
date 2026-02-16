import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import * as flightService from "../services/flight.service";
import { Flight, SearchFlightsParams } from "../types/flight.types";
import { successResponse } from "../utils/helpers/response.helper";
import { JourneysInfoDTO, SeatsDTO } from "../dtos/flight.dto";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { BadRequestError } from "../utils/errors";

export const searchFlights = asyncHandler(
     async(req : Request, res : Response): Promise<Response> => {

        const sortBy : string = (req.query.sort_by as string) || 'total_price';
        const order : string = ((req.query.order as string) || 'asc').toLowerCase();
        const departureAirportCity : string | undefined = req.query.from as string;
        const arrivalAirportCity : string | undefined = req.query.to as string;
        const nStops = Number.isNaN(Number(req.query.n_stops)) ? 1 : Number(req.query.n_stops);
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

        const page: number = parseInt((req.query.page as string) || '1') || 1;
        const limit: number = parseInt((req.query.limit as string) || '10') || 10;

        const total: number = journeys.length;
        const start = (page - 1) * limit;
        const paginated = journeys.slice(start, start + limit);

        return successResponse<any>(
            res,
            "Flight retrieved successfully",
            { journeys: paginated, total, page, limit }
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
