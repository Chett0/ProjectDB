import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlineRoute, airlines, airports, extras, routes } from "../../prisma/generated/prisma";
import * as airlineService from "../services/airline.service";
import * as airportService from "../services/airport.service";
import { setMissingFieldsResponse, setResponse } from "../utils/helpers/response.helper";
import { AirlineDTO } from "../dtos/user.dto";
import { AirlineRouteDTO, ExtraDTO } from "../dtos/airline.dto";
import { Extra, Route } from "../types/airline.types";
import { toAirportDTO } from "../dtos/airport.dto";


const getAirlineDetails = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            setMissingFieldsResponse(res);
            return;
        }

        const airline : airlines | null = await airlineService.getAirlineById(airlineId);

        if(!airline){
            setResponse(res, false, 404, "Airline not found");
            return;
        }

        const airlineResponse : AirlineDTO = {
            id: airline.id,
            name: airline.name,
            code: airline.code
        }

        setResponse(res, true, 200, "Airline retrieved successfully", airlineResponse);
    }
    catch (error) {
        console.error("Error while retieving airline: ", error);
        setResponse(res, false, 500, "Internal server error while retrieving airline");
    }
};

const getAirlineRoutes = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            setMissingFieldsResponse(res);
            return;
        }

        const routes : AirlineRouteDTO[] = await airlineService.getAirlineRoutes(airlineId);

        setResponse(res, true, 200, "Airline routes retrieved successfully", routes);
    }
    catch (error) {
        console.error("Error while retieving airline routes: ", error);
        setResponse(res, false, 500, "Internal server error while retrieving airline routes");
    }
};

const createAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const { departureAirportCode, arrivalAirportCode } = req.body; 
        
        if(!airlineId || !departureAirportCode || !arrivalAirportCode){
            setMissingFieldsResponse(res);
            return;
        }

        const departureAirport : airports | null = await airportService.getAirportByCode(departureAirportCode);
        const arrivalAirport : airports | null = await airportService.getAirportByCode(arrivalAirportCode);

        if(!departureAirport || !arrivalAirport){
            setResponse(res, false, 404, "Airports not exists");
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
            setResponse(res, false, 409, "Airline route already registered")
            return;
        }

        const routeResult : AirlineRouteDTO = {
            id: newRoute.id,
            departureAirport: toAirportDTO(departureAirport),
            arrivalAirport: toAirportDTO(arrivalAirport)
        }   

        setResponse(res, true, 200, "Route created successfully", routeResult);
    }
    catch (error) {
        console.error("Error while creating airline routes: ", error);
        setResponse(res, false, 500, "Internal server error while creating airline routes");
    }
};



const getAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;
        
        if(!airlineId || !paramsId){
            setMissingFieldsResponse(res);
            return;
        }

        const routeId : number = parseInt(paramsId);

        const route : AirlineRouteDTO | null = await airlineService.getAirlineRouteById(airlineId, routeId);

        if(!route){
            setResponse(res, false, 404, "Airline route not found");
            return;
        }

        setResponse(res, true, 200, "Airline route retrieved successfully", route);
    }
    catch (error) {
        console.error("Error while retieving airline route: ", error);
        setResponse(res, false, 500, "Internal server error while retrieving airline route");
    }
};

const deleteAirlineRoute = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsId : string | undefined = req.params.id;
        
        if(!airlineId || !paramsId){
            setMissingFieldsResponse(res);
            return;
        }

        const routeId : number = parseInt(paramsId);

        const route : airlineRoute | null = await airlineService.deleteAirlineRouteById(airlineId, routeId);

        if(!route){
            setResponse(res, false, 404, "Airline route not found");
            return;
        }

        setResponse(res, true, 200, "Airline route deleted successfully");
    }
    catch (error) {
        console.error("Error while deleting airline route: ", error);
        setResponse(res, false, 500, "Internal server error while deleting airline route");
    }
};


const createExtra = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const {name, price} = req.body;
        
        if(!airlineId || !name || !price){
            setMissingFieldsResponse(res);
            return;
        }

        const extra : Extra = {
            name: name,
            price: price
        }

        const newExtra : ExtraDTO = await airlineService.createExtra(airlineId, extra);

        setResponse(res, true, 200, "Extra created successfully", newExtra);
    }
    catch (error) {
        console.error("Error while creating extra: ", error);
        setResponse(res, false, 500, "Internal server error while creating extra");
    }
};


const getAirlineExtras = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        
        if(!airlineId){
            setMissingFieldsResponse(res);
            return;
        }

        const extras : ExtraDTO[] = await airlineService.getAirlineExtras(airlineId);

        setResponse(res, true, 200, "Airline extras retrieved successfully", extras);
    }
    catch (error) {
        console.error("Error while retrieving airline extras: ", error);
        setResponse(res, false, 500, "Internal server error while retrieving airline extras");
    }
};

const deleteExtraById = async(req : AuthenticatedRequest, res : Response): Promise<void> => {
    try{
        const airlineId : number | null = req.user!.id;
        const paramsExtraId : string | undefined = req.params.extraId;
        
        if(!airlineId || !paramsExtraId){
            setMissingFieldsResponse(res);
            return;
        }

        const extraId : number = parseInt(paramsExtraId);

        const extra : extras | null = await airlineService.deleteExtraById(airlineId, extraId);

        if(!extra){
            setResponse(res, false, 404, "Extra not found");
            return;
        }

        setResponse(res, true, 200, "Extra deleted successfully");
    }
    catch (error) {
        console.error("Error while deleting extra: ", error);
        setResponse(res, false, 500, "Internal server error while deleting extra");
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
    deleteExtraById
}