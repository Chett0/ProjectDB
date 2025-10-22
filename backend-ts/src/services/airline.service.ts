import { airlineRoute, airlines, routes } from "../../prisma/generated/prisma";
import prisma from "../config/db";
import { AirlineRouteDTO } from "../dtos/airline.dto";
import { Route } from "../types/airline.types";

const getAirlineById = async (
    airlineId : number
) : Promise<airlines | null> => {
    try{
        const airline : airlines | null = await prisma.airlines.findUnique({
            where: {
                id: airlineId
            }
        })

        return airline;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getAirlineRoutes = async (
    airlineId : number
) : Promise<AirlineRouteDTO[]> => {
    try{
        const routes : AirlineRouteDTO[] = await prisma.$queryRaw`
            SELECT 
                R.id, 
                json_build_object(
                    'id', AD.id,
                    'name', AD.name,
                    'code', AD.code,
                    'city', AD.city,
                    'country', AD.country
                ) AS "departureAirport",
                json_build_object(
                    'id', AA.id,
                    'name', AA.name,
                    'code', AA.code,
                    'city', AA.city,
                    'country', AA.country
                ) AS "arrivalAirport"
            FROM public."airlineRoute" A 
            JOIN Routes R ON A.route_id = R.id 
            JOIN Airports AD ON R.departure_airport_id = AD.id 
            JOIN Airports AA ON R.arrival_airport_id = AA.id
            WHERE A.airline_id = ${airlineId} 
                AND A.active = true 
        `;

        return routes;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const createAirlineRoute = async (
    airlineId : number,
    route : Route
) : Promise<routes | null> => {
    try{

        let existingRoute : routes | null = await getRoute(route.departureAirportId, route.arrivalAirportId);

        const newRoute : routes | null = await prisma.$transaction(async(tx) => {

            if(!existingRoute){
                const newRoute : routes = await tx.routes.create({
                    data: {
                        departure_airport_id: route.departureAirportId,
                        arrival_airport_id: route.arrivalAirportId
                    }
                });

                existingRoute = newRoute;
            }

            let existingAirlineRoute : airlineRoute | null = await getAirlineRoute(airlineId, existingRoute.id);

            if(existingAirlineRoute){
                if(!existingAirlineRoute.active){
                    await tx.airlineRoute.update({
                        where: {
                            airline_id_route_id: {
                                airline_id: airlineId,
                                route_id: existingRoute.id
                            }
                        },
                        data: {
                            active: true
                        }
                    })
                }
                else
                    return null;
            }
            else{
                const newAirlineRoute : airlineRoute | null = await tx.airlineRoute.create({
                    data: {
                        airline_id: airlineId,
                        route_id: existingRoute.id
                    }
                });

                existingAirlineRoute = newAirlineRoute;
            }

            if(!existingRoute || !existingAirlineRoute)
                throw new Error("Airline route not created");

            return existingRoute;
        });

        return newRoute;


    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getRoute = async (
    departureAirportId : number,
    arrivalAirportId : number
) : Promise<routes | null> => {
    try{
        const route : routes | null = await prisma.routes.findFirst({
            where: {
                departure_airport_id : departureAirportId,
                arrival_airport_id: arrivalAirportId
            }
        })

        return route;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getAirlineRoute = async (
    airlineId : number,
    routeId : number
) : Promise<airlineRoute | null> => {
    try{
        const airlineRoute : airlineRoute | null = await prisma.airlineRoute.findFirst({
            where: {
                airline_id : airlineId,
                route_id: routeId
            }
        })
        return airlineRoute;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};



export {
    getAirlineById,
    getAirlineRoutes,
    getRoute,
    createAirlineRoute
}