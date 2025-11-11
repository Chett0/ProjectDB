import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlineRoute, routes } from '@prisma/client';
import * as airlineService from "../services/airline.service";
import * as airportService from "../services/airport.service";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { AirlineDTO } from "../dtos/user.dto";
import { AircraftDTO, AircraftInfoDTO, AirlineRouteDTO, ChartsDTO, ClassDTO, DashBoardDTO, ExtraDTO, RoutesMostInDemandDTO } from "../dtos/airline.dto";
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

        const extra : ExtraDTO | null = await airlineService.deleteExtraById(airlineId, extraId);

        if(!extra){
            return notFoundResponse(res, "Extra not found");
        }

        return successResponse(res, "Extra deleted successfully", extra);
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


const getAirlineChartsStats = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number | null = req.user!.id;

        let nRoutes : number = parseInt(req.query.nRoutes as string) || 10;
        
        if(!airlineId){
            return missingFieldsResponse(res);
        }

        const routesMostInDemand : RoutesMostInDemandDTO[] = await airlineService.getRoutesMostInDemand(airlineId, nRoutes);

        const charts : ChartsDTO = new ChartsDTO(
            routesMostInDemand
        )

        return successResponse<ChartsDTO>(res, "Charts stats retrieved successfully", charts);
    }
    catch (error) {
        console.error("Error while retrieving charts stats: ", error);
        return errorResponse(res, "Internal server error while retrieving charts stats");
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

        const newAircraft : AircraftDTO | null = await airlineService.createAirlineAircraft(airlineId, aircraft, classes);
        if(!newAircraft){
            return errorResponse(res, "Aircraft not created", null, 409);
        }

        return successResponse(res, "Aircraft created successfully", newAircraft, 201);
    }
    catch (error) {
        console.error("Error while creating aircraft: ", error);
        return errorResponse(res, "Internal server error while creating aircraft");
    }
};


const getAirlinesAircrafts = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number = req.user!.id; 

        const aircrafts : AircraftInfoDTO[] = await airlineService.getAirlinesAircrafts(airlineId);

        return successResponse(res, "Airline's aircraft retrieved successfully", aircrafts);
    }
    catch (error) {
        console.error("Error while retrieving airline's aircrafts: ", error);
        return errorResponse(res, "Internal server error while retrieving airline's aircrafts");
    }
};

const deleteAircraft = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number = req.user!.id; 
        const paramsAircraftId : string | undefined = req.params.aircraftId;
        
        if(!airlineId || !paramsAircraftId){
            return missingFieldsResponse(res);
        }

        const aircraftId : number = parseInt(paramsAircraftId);

        const aircraft : AircraftInfoDTO | null = await airlineService.deleteAircraft(airlineId, aircraftId);

        if(!aircraft)
            return notFoundResponse(res, "Aircraft not found");


        return successResponse(res, "Airline's aircraft deleted successfully", aircraft);
    }
    catch (error) {
        console.error("Error while deleting aircraft: ", error);
        return errorResponse(res, "Internal server error while deleting aircrafts");
    }
};

const getAircraftClasses = async(req : AuthenticatedRequest, res : Response): Promise<Response> => {
    try{
        const airlineId : number = req.user!.id; 
        const paramsAircraftId : string | undefined = req.params.aircraftId;
        
        if(!airlineId || !paramsAircraftId){
            return missingFieldsResponse(res);
        }

        const aircraftId : number = parseInt(paramsAircraftId);

        const classes : ClassDTO[] | null = await airlineService.getAircraftClasses(airlineId, aircraftId);

        if(!classes)
            return notFoundResponse(res, "Aircraft not found");

        return successResponse(res, "Airline's aircraft deleted successfully", classes);
    }
    catch (error) {
        console.error("Error while deleting aircraft: ", error);
        return errorResponse(res, "Internal server error while deleting aircrafts");
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
    getAirlinesAircrafts,   
    deleteAircraft,
    getAircraftClasses,
    getAirlineChartsStats
}