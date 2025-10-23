import { airlineRoute, airlines, extras, routes } from "../../prisma/generated/prisma";
import prisma from "../config/db";
import { AirlineRouteDTO, ExtraDTO } from "../dtos/airline.dto";
import { Extra, Route } from "../types/airline.types";

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
            `Failed to retrieving airline: ${err instanceof Error ? err.message : "Unknown error"}`
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
            `Failed to retrieving airline route: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const createAirlineRoute = async (
    airlineId : number,
    route : Route
) : Promise<routes | null> => {
    try{

        let existingRoute : routes | null = await getRouteByAirports(route.departureAirportId, route.arrivalAirportId);

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
            `Failed to create airline route: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getRouteByAirports = async (
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
            `Failed to retrieving route by airports: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAirlineRouteById = async (
    airlineId: number,
    routeId: number
) : Promise<AirlineRouteDTO | null> => {
    try{
        const route : AirlineRouteDTO | null = await prisma.$queryRaw`
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
                AND R.id = ${routeId}
        `;

        return route;
    } catch(err){
        throw new Error(
            `Failed to retrieving airline route: ${err instanceof Error ? err.message : "Unknown error"}`
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
            `Failed to retrieving airline routes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const deleteAirlineRouteById = async (
    airlineId : number,
    routeId : number
) : Promise<airlineRoute | null> => {
    try{
        const airlineRoute : airlineRoute | null = await prisma.airlineRoute.update({
            where: {
                airline_id_route_id : {
                    airline_id: airlineId,
                    route_id: routeId
                }
            },
            data : {
                active: true,
                deletion_time: new Date()
            }
        })
        return airlineRoute;
    } catch(err){
        throw new Error(
            `Failed to deleting airline routes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const createExtra = async (
    airlineId : number,
    extra : Extra
) : Promise<ExtraDTO> => {
    try{
        const newExtra : extras = await prisma.extras.create({
            data: {
                name: extra.name,
                price: extra.price,
                airline_id: airlineId
            }
        });

        const resultExtra : ExtraDTO = {
            id: newExtra.id,
            name: extra.name,
            price: extra.price
        };

        return resultExtra;

    } catch(err){
        throw new Error(
            `Failed to create extra: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAirlineExtras = async (
    airlineId : number
) : Promise<ExtraDTO[]> => {
    try{
        const extras : ExtraDTO[] = await prisma.extras.findMany({
            where: {
                airline_id: airlineId,
                active: true
            },
            select: {
                id: true,
                name: true,
                price: true
            }
        })

        return extras;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline extras: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const deleteExtraById = async (
    airlineId : number,
    extraId: number
) : Promise<extras | null> => {
    try{
        const extras : extras | null = await prisma.extras.update({
            where: {
                airline_id: airlineId,
                id: extraId,
                active: true
            },
            data : {
                active: false,
                deletion_time: new Date()
            }
        });

        return extras;

    } catch(err){
        throw new Error(
            `Failed to delete extra: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};



const getAirlinePassengerCount = async (
    airlineId : number
) : Promise<number> => {
    try{
        const passengerCount : number = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT T.passenger_id) as passengerCount
            FROM Tickets T 
            JOIN Flights F ON T.flight_id = F.id
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE A.airline_id = ${airlineId}
        `;
        return passengerCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline passenger count: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAirlineMonthlyIncome = async (
    airlineId : number
) : Promise<number> => {
    try{

        const now = new Date();
        const startOfMonth : Date = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyIncome : number = await prisma.$queryRaw`
            SELECT COALESCE(SUM(T.final_cost), 0)
            FROM Tickets T
            JOIN Flights F ON T.flight_id = F.id
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE 
                A.airline_id = ${airlineId} AND
                T.purchase_date >= ${startOfMonth} AND
                T.purchase_date <= ${endOfMonth}

        `;
        return monthlyIncome as number;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline monthly income: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAirlineRouteCount = async (
    airlineId : number
) : Promise<number> => {
    try{

        const airlineRouteCount : number = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT AR.route_id) as count
            FROM public."airlineRoute" AR
            WHERE AR.airline_id = ${airlineId}
        `;
        return airlineRouteCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline monthly income: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getAirlineFlightsInProgressCount = async (
    airlineId : number
) : Promise<number> => {
    try{

        const now : Date = new Date();
        const filghtsInProgressCount : number = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT F.id)
            FROM Flights F
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE 
                A.airline_id = ${airlineId} AND
                F.departure_time <= ${now} AND
                F.arrival_time >= ${now}

        `;
        return filghtsInProgressCount as number;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline monthly income: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export {
    getAirlineById,
    getAirlineRoutes,
    getRouteByAirports,
    createAirlineRoute,
    getAirlineRouteById,
    deleteAirlineRouteById,
    createExtra,
    getAirlineExtras,
    deleteExtraById,
    getAirlinePassengerCount,
    getAirlineMonthlyIncome,
    getAirlineRouteCount,
    getAirlineFlightsInProgressCount
}