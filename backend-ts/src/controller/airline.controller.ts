import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { aircrafts, airlineRoute } from '@prisma/client';
import * as airlineService from "../services/airline.service";
import { successResponse } from "../utils/helpers/response.helper";
import { AirlineDTO } from "../dtos/user.dto";
import { AircraftDTO, AirlineDashBoardDTO, ClassDTO, ExtraDTO, MonthlyIncomeDTO, RouteDTO, RoutesMostInDemandDTO } from "../dtos/airline.dto";
import { CreateAircraft, Extra } from "../types/airline.types";
import { Flight } from "../types/flight.types";
import { FlightInfoDTO } from "../dtos/flight.dto";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";


//#region Airline info

export const getAirlineDetails = asyncHandler(
     async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | null = req.user!.id;
        if(!airlineId)
            throw new BadRequestError("Airline ID is missing");

        const airline : AirlineDTO | null = await airlineService.getAirlineById(airlineId);
        if(!airline)
            throw new NotFoundError("Airline not found");

        return successResponse<AirlineDTO>(
            res, 
            "Airline retrieved successfully", 
            airline, 
            200
        );
    }
);

export const getAirlineDashboardStats = asyncHandler(
     async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const nRoutes : number = parseInt(req.query.nRoutes as string) || 10;
        const year : number = parseInt(req.query.year as string) || new Date().getFullYear();
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId)
            throw new BadRequestError("Airline ID is missing");

        const passengerCount : number = await airlineService.getAirlinePassengerCount(airlineId);
        const monthlyIncome : number = await airlineService.getAirlineMonthlyIncome(airlineId);
        const activeRoutes : number = await airlineService.getAirlineRouteCount(airlineId);
        const flightsInProgress : number = await airlineService.getAirlineFlightsInProgressCount(airlineId);

        const routesMostInDemand : RoutesMostInDemandDTO[] = await airlineService.getRoutesMostInDemand(airlineId, nRoutes);
        const monthlyIncomes : MonthlyIncomeDTO[] = await airlineService.getAirlineMonthlyIncomesByYear(airlineId, year);


        const dashBoard : AirlineDashBoardDTO = {
            passengerCount: passengerCount,
            monthlyIncome: monthlyIncome,
            activeRoutes: activeRoutes,
            flightsInProgress: flightsInProgress,
            routesMostInDemand: routesMostInDemand,
            monthlyIncomes: monthlyIncomes
        };

        return successResponse<AirlineDashBoardDTO>(
            res, 
            "DashBoard stats retrieved successfully",
            dashBoard
        );
    }
);

//#endregion 


//#region Airline Routes


export const getAirlineRoutes = asyncHandler( 
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | null = req.user!.id;
        if(!airlineId)
            throw new BadRequestError("Airline ID is missing");

        const routes : RouteDTO[] = await airlineService.getAirlineRoutes(airlineId);

        return successResponse<RouteDTO[]>(
            res, 
            "Airline routes retrieved successfully", 
            routes
        );
    }
);

export const createAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

    const airlineId : number | null = req.user!.id;
    const { departureAirportCode, arrivalAirportCode } = req.body;

    if(!airlineId)
        throw new UnauthorizedError("Unauthorized access");

    if(!departureAirportCode || !arrivalAirportCode)
        throw new BadRequestError("Missing required fields");

    const newAirlineRoute : RouteDTO  = await airlineService.createAirlineRoute(
        airlineId,
        departureAirportCode,
        arrivalAirportCode
    )

    return successResponse<RouteDTO>(
        res, 
        "Route created successfully",
        newAirlineRoute, 
        201
    );
};



export const getAirlineRouteById = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;

        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");

        if(!paramsId)
            throw new BadRequestError("Missing route ID parameter");

        const routeId : number = parseInt(paramsId);
        if(isNaN(routeId))
            throw new BadRequestError("Route ID must be a valid number");

        const route : RouteDTO | null = await airlineService.getAirlineRouteById(airlineId, routeId);

        if(!route)
            throw new NotFoundError("Airline route not found");

        return successResponse<RouteDTO>(
            res, 
            "Airline route retrieved successfully", 
            route
        );
    }
);

export const deleteAirlineRoute = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    
        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!paramsId)
            throw new BadRequestError("Missing route ID parameter");

        const routeId : number = parseInt(paramsId);
        if(isNaN(routeId))
            throw new BadRequestError("Route ID must be a valid number");

        const route : airlineRoute | null = await airlineService.deleteAirlineRouteById(airlineId, routeId);

        if(!route)
            throw new NotFoundError("Airline route not found");

        return successResponse<void>(
            res, 
            "Airline route deleted successfully"
        );
    }
);

//#endregion

//#region Extras

export const createExtra = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | null = req.user!.id;
        const {name, price} = req.body;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!name || !price)
            throw new BadRequestError("Missing required fields");

        const extra : Extra = {
            airlineId: airlineId,
            name: name,
            price: price
        }

        const newExtra : ExtraDTO = await airlineService.createExtra(extra);

        return successResponse<ExtraDTO>(
            res, 
            "Extra created successfully", 
            newExtra
        );
    }
);


export const getAirlineExtras = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | null = req.user!.id;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");

        const extras : ExtraDTO[] = await airlineService.getAirlineExtras(airlineId);

        return successResponse<ExtraDTO[]>(
            res, 
            "Airline extras retrieved successfully", 
            extras
        );
    }
);

export const deleteExtraById = asyncHandler(
     async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    
        const airlineId : number | null = req.user!.id;
        const paramsExtraId : string | undefined = req.params.extraId;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!paramsExtraId)
            throw new BadRequestError("Missing extra ID parameter");

        const extraId : number = parseInt(paramsExtraId);
        if(isNaN(extraId))
            throw new BadRequestError("Extra ID must be a valid number");

        const extra : ExtraDTO | null = await airlineService.deleteExtraById(
            airlineId, 
            extraId
        );

        if(!extra)
            throw new NotFoundError("Extra not found");

        return successResponse<ExtraDTO>(
            res, 
            "Extra deleted successfully", 
            extra
        );
    }
);

//#endregion

//#region Aircrafts

export const createAircraft = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    
        const airlineId : number | null = req.user!.id;
        const {model, nSeats, classes} = req.body; 
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!model || !nSeats || !classes)
            throw new BadRequestError("Missing required fields");

        const aircraft : CreateAircraft = {
            airlineId: airlineId,
            model: model,
            nSeats: nSeats,
            classes: classes
        };

        const newAircraft : AircraftDTO | null = await airlineService.createAirlineAircraft(aircraft);

        return successResponse<AircraftDTO>(
            res, 
            "Aircraft created successfully", 
            newAircraft, 
            201
        );
    }
);


export const getAirlinesAircrafts = asyncHandler( 
    async(req : AuthenticatedRequest, res : Response): Promise<Response<AircraftDTO[]>> => {
        const airlineId : number = req.user!.id; 
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");

        const aircrafts : AircraftDTO[] = await airlineService.getAirlinesAircrafts(airlineId);

        return successResponse<AircraftDTO[]>(
            res, 
            "Airline's aircraft retrieved successfully", 
            aircrafts
        );
    }
);

export const deleteAircraft = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number = req.user!.id; 
        const paramsAircraftId : string | undefined = req.params.aircraftId;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!paramsAircraftId)
            throw new BadRequestError("Missing aircraft ID parameter");

        const aircraftId : number = parseInt(paramsAircraftId);
        if(isNaN(aircraftId))
            throw new BadRequestError("Aircraft ID must be a valid number");

        const aircraft : aircrafts | null = await airlineService.deleteAircraft(
            airlineId, 
            aircraftId
        );

        if(!aircraft)
            throw new NotFoundError("Aircraft not found");

        return successResponse<void>(
            res, 
            "Airline's aircraft deleted successfully"
        );
    }
);

export const getAircraftClasses = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
        const airlineId : number = req.user!.id; 
        const paramsAircraftId : string | undefined = req.params.aircraftId;
        
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");
        if(!paramsAircraftId)
            throw new BadRequestError("Missing aircraft ID parameter");

        const aircraftId : number = parseInt(paramsAircraftId);
        if(isNaN(aircraftId))
            throw new BadRequestError("Aircraft ID must be a valid number");

        const classes : ClassDTO[] = await airlineService.getAirlineAircraftClasses(airlineId, aircraftId);

        return successResponse<ClassDTO[]>(
            res, 
            "Airline's aircraft classes retrieved successfully", 
            classes
        );  
    }
);

//#endregion

//#region Flights

export const getAirlineFlights = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number = req.user!.id; 
        if(!airlineId)
            throw new UnauthorizedError("Unauthorized access");

        const page = parseInt(String(req.query.page || '1')) || 1;
        const limit = parseInt(String(req.query.limit || '10')) || 10;
        const q = req.query.q as string | undefined;
        const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const order = req.query.order as string | undefined;

        const filters: { q?: string; maxPrice?: number; sortBy?: string; order?: string } = {};
        if (q !== undefined && q !== null && String(q).trim() !== '') filters.q = String(q).trim();
        if (req.query.maxPrice !== undefined) filters.maxPrice = Number(req.query.maxPrice);
        if (sortBy !== undefined && sortBy !== null && String(sortBy).trim() !== '') filters.sortBy = String(sortBy).trim();
        if (order !== undefined && order !== null && String(order).trim() !== '') filters.order = String(order).trim();

        const { flights, total } = await airlineService.getAirlineFlightsPaginated(airlineId, page, limit, filters);

        return successResponse<any>(
            res,
            "Airline's flights retrieved successfully",
            { flights, total, page, limit }
        );
    }
);

export const createAirlineFlight = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

    const airlineId : number = req.user!.id;
    const {routeId, aircraftId, departureTime, arrivalTime, basePrice} = req.body;
    
    if(!airlineId)
        throw new UnauthorizedError("Unauthorized access");
    if(!routeId || !aircraftId || !departureTime || !arrivalTime || !basePrice)
        throw new BadRequestError("Missing required fields");

    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);

    if(dep >= arr)
        throw new BadRequestError("Arrival time must be after departure time");

    const flight : Flight = {
        airlineId: airlineId,
        routeId : Number(routeId),
        aircraftId : Number(aircraftId),
        departureTime: dep,
        arrivalTime: arr,
        basePrice: Number(basePrice),
        durationSeconds: Math.floor((arr.getTime() - dep.getTime()) / 1000),
    }

    if(isNaN(flight.routeId))
        throw new BadRequestError("Route ID must be a valid number");
    if(isNaN(flight.aircraftId))
        throw new BadRequestError("Aircraft ID must be a valid number");
    if(isNaN(flight.basePrice))
        throw new BadRequestError("Base Price must be a valid number");


    const newFlight : FlightInfoDTO = await airlineService.createAirlineFlight(flight);

    return successResponse<FlightInfoDTO>(
        res, 
        "Airline's flight created successfully", 
        newFlight
    );
};

//#endregion