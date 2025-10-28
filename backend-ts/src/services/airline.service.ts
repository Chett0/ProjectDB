import { aircraft_classes, aircrafts, airlineRoute, airlines, extras, routes } from "../../prisma/generated/prisma";
import prisma from "../config/db";
import { AircraftDTO, AircraftInfoDTO, AirlineRouteDTO, ClassDTO, ExtraDTO } from "../dtos/airline.dto";
import { AirlineDTO } from "../dtos/user.dto";
import { Aircraft, Class, Extra, Route } from "../types/airline.types";

const getAirlineById = async (
    airlineId : number
) : Promise<AirlineDTO | null> => {
    try{
        const airline : airlines | null = await prisma.airlines.findUnique({
            where: {
                id: airlineId
            }
        })

        return airline ? AirlineDTO.fromPrisma(airline) : null;
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
        const routes : AirlineRouteDTO[] | null = await prisma.$queryRaw`
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

        return routes ? routes : [];
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


const getRouteByAirportsIds = async (
    AirportIds : number[],
    departure : boolean = true
) : Promise<routes[]> => {
    try{

        let airportField : string = "departure_airport_id";
        if(!departure)
            airportField = "arrival_airport_id";


        const routes : routes[] = await prisma.routes.findMany({
            where: {
                [airportField]: {
                    in : AirportIds
                }
            }
        })

        return routes;
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

        return ExtraDTO.fromPrisma(newExtra);

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
        
        const extras : extras[] = await prisma.extras.findMany({
            where: {
                airline_id: airlineId,
                active: true
            }
        });

        return ExtraDTO.fromPrismaList(extras);

    } catch(err){
        throw new Error(
            `Failed to retrieving airline extras: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const deleteExtraById = async (
    airlineId : number,
    extraId: number
) : Promise<ExtraDTO | null> => {
    try{
        const extra : extras | null = await prisma.extras.update({
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

        return extra ? ExtraDTO.fromPrisma(extra) : null;

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
        const result = await prisma.$queryRaw<{ passengerCount: number }[]>`
            SELECT COUNT(DISTINCT T.passenger_id) as "passengerCount"
            FROM Tickets T 
            JOIN Flights F ON T.flight_id = F.id
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE A.airline_id = ${airlineId}
        `;
        
        const passengerCount : number = Number(result[0]?.passengerCount ?? 0);
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

        const result = await prisma.$queryRaw<{ monthlyIncome: number }[]>`
            SELECT COALESCE(SUM(T.final_cost), 0) as "monthlyIncome"
            FROM Tickets T 
            JOIN Flights F ON T.flight_id = F.id
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE 
                A.airline_id = ${airlineId} AND
                T.purchase_date >= ${startOfMonth} AND
                T.purchase_date <= ${endOfMonth}

        `;

        const monthlyIncome : number = Number(result[0]?.monthlyIncome ?? 0);
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
        const result = await prisma.$queryRaw<{ activeRoutes: number }[]>`
            SELECT COUNT(DISTINCT AR.route_id) as "activeRoutes"
            FROM public."airlineRoute" AR
            WHERE AR.airline_id = ${airlineId}
        `;

        const airlineRouteCount : number = Number(result[0]?.activeRoutes ?? 0);
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
        const result = await prisma.$queryRaw<{ flightsInProgress: number }[]>`
            SELECT COUNT(DISTINCT F.id) as "flightsInProgress"
            FROM Flights F
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE 
                A.airline_id = ${airlineId} AND
                F.departure_time <= ${now} AND
                F.arrival_time >= ${now}
        `;

        const filghtsInProgressCount : number = Number(result[0]?.flightsInProgress ?? 0);
        return filghtsInProgressCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airline monthly income: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAirlinesAircrafts = async (
    airlineId : number
) : Promise<AircraftInfoDTO[]> => {
    try{

        const aircrafts : aircrafts[] = await prisma.aircrafts.findMany({
            where: {
                airline_id: airlineId,
                active: true
            }
        });

        return AircraftInfoDTO.fromPrismaList(aircrafts);

    } catch(err){
        throw new Error(
            `Failed to creating aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const createAirlineAircraft = async (
    airlineId : number,
    aircraft : Aircraft,
    classes: Class[]
) : Promise<AircraftDTO | null> => {
    try{

        const newAircraft : aircrafts | null = await prisma.aircrafts.create({
            data: {
                airline_id: airlineId,
                model: aircraft.model,
                nSeats: aircraft.nSeats,
            }
        })

        if(!newAircraft)
            return null;

        const newClasses : ClassDTO[] = await createAircraftClasses(newAircraft.id, classes);

        return AircraftDTO.fromPrismaDTO(newAircraft, newClasses);

    } catch(err){
        throw new Error(
            `Failed to creating aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const createAircraftClasses = async (
    aircraftId : number,
    classes : Class[]
) : Promise<ClassDTO[]> => {
    try{
        let aircraftClasses : aircraft_classes[] = [];
        for(const cls of classes){
            aircraftClasses.push(await prisma.aircraft_classes.create({
                data:{
                    aircraft_id: aircraftId,
                    name: cls.name,
                    nSeats: cls.nSeats,
                    price_multiplier: cls.priceMultiplier
                }
            }));
        };

        return ClassDTO.fromPrismaList(aircraftClasses);

    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const deleteAircraft = async (
    airlineId : number,
    aircraftId : number
) : Promise<AircraftInfoDTO | null> => {
    try{
        
        const aircraft : aircrafts | null = await prisma.aircrafts.findUnique({
            where : {
                id: aircraftId,
                airline_id: airlineId,
                active: true
            }
        });

        if(!aircraft)
            return null;

        await prisma.aircrafts.update({
            where: {
                id: aircraftId
            },
            data: {
                active: false,
                deletion_time: new Date()
            }
        })

        return AircraftInfoDTO.fromPrisma(aircraft);


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getAircraftClasses = async (
    airlineId : number,
    aircraftId : number
) : Promise<ClassDTO[] | null> => {
    try{
        
        const aircraft : aircrafts | null = await prisma.aircrafts.findUnique({
            where : {
                id: aircraftId,
                airline_id: airlineId,
                active: true
            }
        });

        if(!aircraft)
            return null;

        const classes : aircraft_classes[] = await prisma.aircraft_classes.findMany({
            where: {
                aircraft_id: aircraftId
            }
        })

        return ClassDTO.fromPrismaList(classes);


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
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
    getAirlineFlightsInProgressCount,
    createAirlineAircraft,
    createAircraftClasses,
    getAirlinesAircrafts,
    deleteAircraft,
    getAircraftClasses,
    getRouteByAirportsIds
}