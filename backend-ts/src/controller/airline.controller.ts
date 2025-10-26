import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { aircraft_classes, aircrafts, airlineRoute, airlines, airports, extras, routes } from "../../prisma/generated/prisma";
import * as airlineService from "../services/airline.service";
import * as airportService from "../services/airport.service";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { AirlineDTO } from "../dtos/user.dto";
import { AircraftDTO, AirlineRouteDTO, ClassDTO, DashBoardDTO, ExtraDTO } from "../dtos/airline.dto";
import { Aircraft, Extra, Route } from "../types/airline.types";
import { AirportDTO } from "../dtos/airport.dto";


const getAirlineDetails = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            return missingFieldsResponse(res);
        }

        const airline : AirlineDTO | null = await airlineService.getAirlineById(airlineId);

        if(!airline){
            return notFoundResponse(res, "Airline not found");
        }

        return successResponse(res, "Airline retrieved successfully", airline, 200);
    }
    catch (error) {
        console.error("Error while retieving airline: ", error);
        return errorResponse(res, "Internal server error while retrieving airline");
    }
};

const getAirlineRoutes = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            return missingFieldsResponse(res);
        }

        const routes : AirlineRouteDTO[] = await airlineService.getAirlineRoutes(airlineId);

        return successResponse(res, "Airline routes retrieved successfully", routes);
    }
    catch (error) {
        console.error("Error while retieving airline routes: ", error);
        return errorResponse(res, "Internal server error while retrieving airline routes");
    }
};

const createAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const { departureAirportCode, arrivalAirportCode } = req.body; 
        
        if(!airlineId || !departureAirportCode || !arrivalAirportCode){
            return missingFieldsResponse(res);
        }

        const departureAirport : AirportDTO | null = await airportService.getAirportByCode(departureAirportCode);
        const arrivalAirport : AirportDTO | null = await airportService.getAirportByCode(arrivalAirportCode);

        if(!departureAirport || !arrivalAirport){
            return errorResponse(res, "Airports not exists", null, 404);
        } 

        const route : Route = {
            departureAirportId: departureAirport.id,
            arrivalAirportId: arrivalAirport.id
        }

        const newRoute : routes | null = await airlineService.createAirlineRoute(
            airlineId,
            route
        )

        if(!newRoute){
            return errorResponse(res, "Airline route already registered", null, 409);
        }

        const routeResult : AirlineRouteDTO = {
            id: newRoute.id,
            departureAirport: departureAirport,
            arrivalAirport: arrivalAirport
        }   

        return successResponse(res, "Route created successfully", routeResult, 201);
    }
    catch (error) {
        console.error("Error while creating airline routes: ", error);
        return errorResponse(res, "Internal server error while creating airline routes");
    }
};



const getAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;
        
        if(!airlineId || !paramsId){
            return missingFieldsResponse(res);
        }

        const routeId : number = parseInt(paramsId);

        const route : AirlineRouteDTO | null = await airlineService.getAirlineRouteById(airlineId, routeId);

        if(!route){
            return notFoundResponse(res, "Airline route not found");
        }

        return successResponse(res, "Airline route retrieved successfully", route);
    }
    catch (error) {
        console.error("Error while retieving airline route: ", error);
        return errorResponse(res, "Internal server error while retrieving airline route");
    }
};

const deleteAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;
        
        if(!airlineId || !paramsId){
            return missingFieldsResponse(res);
        }

        const routeId : number = parseInt(paramsId);

        const route : airlineRoute | null = await airlineService.deleteAirlineRouteById(airlineId, routeId);

        if(!route){
            return notFoundResponse(res, "Airline route not found");
        }

        return successResponse(res, "Airline route deleted successfully");
    }
    catch (error) {
        console.error("Error while deleting airline route: ", error);
        return errorResponse(res, "Internal server error while deleting airline route");
    }
};


const createExtra = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const {name, price} = req.body;
        
        if(!airlineId || !name || !price){
            return missingFieldsResponse(res);
        }

        const extra : Extra = {
            name: name,
            price: price
        }

        const newExtra : ExtraDTO = await airlineService.createExtra(airlineId, extra);

        return successResponse(res, "Extra created successfully", newExtra);
    }
    catch (error) {
        console.error("Error while creating extra: ", error);
        return errorResponse(res, "Internal server error while creating extra");
    }
};


const getAirlineExtras = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            return missingFieldsResponse(res);
        }

        const extras : ExtraDTO[] = await airlineService.getAirlineExtras(airlineId);

        return successResponse(res, "Airline extras retrieved successfully", extras);
    }
    catch (error) {
        console.error("Error while retrieving airline extras: ", error);
        return errorResponse(res, "Internal server error while retrieving airline extras");
    }
};

const deleteExtraById = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsExtraId : string | undefined = req.params.extraId;
        
        if(!airlineId || !paramsExtraId){
            return missingFieldsResponse(res);
        }

        const extraId : number = parseInt(paramsExtraId);

        const extra : extras | null = await airlineService.deleteExtraById(airlineId, extraId);

        if(!extra){
            return notFoundResponse(res, "Extra not found");
        }

        return successResponse(res, "Extra deleted successfully");
    }
    catch (error) {
        console.error("Error while deleting extra: ", error);
        return errorResponse(res, "Internal server error while deleting extra");
    }
};


const getAirlineDashboardStats = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            return missingFieldsResponse(res);
        }

        const passengerCount : number = await airlineService.getAirlinePassengerCount(airlineId);
        const monthlyIncome : number = await airlineService.getAirlineMonthlyIncome(airlineId);
        const activeRoutes : number = await airlineService.getAirlineRouteCount(airlineId);
        const filghtsInProgress : number = await airlineService.getAirlineFlightsInProgressCount(airlineId);


        const dashBoard : DashBoardDTO = new DashBoardDTO (
            passengerCount,
            monthlyIncome,
            activeRoutes,
            filghtsInProgress
        )

        return successResponse(res, "DashBoard stats retrieved successfully", dashBoard);
    }
    catch (error) {
        console.error("Error while retrieving dashboard stats: ", error);
        return errorResponse(res, "Internal server error while retrieving dashboard stats");
    }
};


const createAircraft = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const {model, nSeats, classes} = req.body; 
        
        if(!airlineId || !model || !nSeats || !classes){
            return missingFieldsResponse(res);
        }

        const aircraft : Aircraft = {
            model: model,
            nSeats: nSeats,
            classes: classes
        };

        const newAircraft : aircrafts | null = await airlineService.createAirlineAircraft(airlineId, aircraft);
        if(!newAircraft){
            return errorResponse(res, "Aircraft not created", null, 409);
        }

        const aircraftId : number = newAircraft.id;
        const aircraftClasses : ClassDTO[] = await airlineService.createAircraftClasses(aircraftId, classes);

        const aircraftResult : AircraftDTO = AircraftDTO.fromPrismaDTO(newAircraft, aircraftClasses);

        return successResponse(res, "Aircraft created successfully", aircraftResult, 201);
    }
    catch (error) {
        console.error("Error while creating aircraft: ", error);
        return errorResponse(res, "Internal server error while creating aircraft");
    }
};

// ###
const createFlight = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;
        const {routeId, aircraftId, departureTime, arrivalTime, basePrice} = req.body; 
        
        if(!airlineId || !routeId || !aircraftId || !departureTime || !arrivalTime || !basePrice){
            return missingFieldsResponse(res);
        }

        const route : AirlineRouteDTO | null = await airlineService.getAirlineRouteById(airlineId, routeId);
        if(!route){
            return notFoundResponse(res, "Airline route not found");
        }

        // const aircraft  = await airlineService.get



        return successResponse(res, "Flight created successfully");
    }
    catch (error) {
        console.error("Error while creating flight: ", error);
        return errorResponse(res, "Internal server error while creating flight");
    }
};

export {
    getAirlineDetails,
    getAirlineRoutes,
    createAirlineRoute,
    getAirlineRoute,
    deleteAirlineRoute,
    createExtra,
    getAirlineExtras,
    deleteExtraById,
    getAirlineDashboardStats,
    createAircraft,
    createFlight
}