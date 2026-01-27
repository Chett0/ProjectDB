import { aircraft_classes, aircrafts, airlineRoute, airlines, airports, extras, Prisma, routes } from '@prisma/client';
import prisma from "../config/db";
import { AircraftDTO, AircraftInfoDTO, AirlineRouteDTO, ClassDTO, ExtraDTO, MonthlyIncomeDTO, RoutesMostInDemandDTO, toAircraftDTO, toAircraftInfoDTO, toAirlineRouteDTO, toClassDTO, toExtraDTO } from "../dtos/airline.dto";
import { AirlineDTO, toAirlineDTO } from "../dtos/user.dto";
import { AircraftWithClasses, AirlineRoute, Class, CreateAircraft, Extra, Route, RoutesMostInDemand } from "../types/airline.types";
import { FlightInfoDTO, toFlightInfoDTO } from '../dtos/flight.dto';
import { Flight, FlightInfo } from '../types/flight.types';
import { connect } from 'http2';

export const getAirlineById = async (
    airlineId : number
) : Promise<AirlineDTO | null> => {
    try{
        const airline : airlines | null = await prisma.airlines.findUnique({
            where: {
                id: airlineId
            }
        })

        return airline ? toAirlineDTO(airline) : null;
    } catch(err){
        throw new Error(
            `Failed to retrieving airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export const getAirlineRoutes = async (
    airlineId : number
) : Promise<AirlineRouteDTO[]> => {
    try{

        const routes : AirlineRoute[] = await prisma.airlineRoute.findMany({
            where: {
                airline_id: airlineId,
                active: true
            },
            include: {
                routes: {
                    include: {
                        departure_airport: true,
                        arrival_airport: true
                    }
                }
            }
        });

        return routes.map(toAirlineRouteDTO);
    } catch(err){
        throw new Error(
            `Failed to retrieving airline route: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const createAirlineRoute = async (
    airlineId : number,
    route : Route
) : Promise<routes> => {
    try{

        let existingRoute : routes | null = await getRouteByAirports(route.departureAirportId, route.arrivalAirportId);

        const newRoute : routes  = await prisma.$transaction(async(tx) => {

            if(!existingRoute){
                const newRouteResult : routes = await tx.routes.create({
                    data: {
                        departure_airport_id: route.departureAirportId,
                        arrival_airport_id: route.arrivalAirportId
                    }
                });

                existingRoute = newRouteResult;
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
            }
            else{
                const newAirlineRoute : airlineRoute = await tx.airlineRoute.create({
                    data: {
                        airline_id: airlineId,
                        route_id: existingRoute.id
                    }
                });

                existingAirlineRoute = newAirlineRoute;
            };

            return existingRoute;
        });

        return newRoute;


    } catch(err){
        throw new Error(
            `Failed to create airline route: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const getRouteByAirports = async (
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


export const getRouteByAirportsIds = async (
    AirportIds : number[],
    departure : boolean
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



export const getAirlineRouteById = async (
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

export const getAirlineRoute = async (
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


export const deleteAirlineRouteById = async (
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
                active: false,
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


export const createExtra = async (
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

        return toExtraDTO(newExtra);

    } catch(err){
        throw new Error(
            `Failed to create extra: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const getAirlineExtras = async (
    airlineId : number
) : Promise<ExtraDTO[]> => {
    try{
        
        const extras : extras[] = await prisma.extras.findMany({
            where: {
                airline_id: airlineId,
                active: true
            }
        });

        return extras.map(toExtraDTO);

    } catch(err){
        throw new Error(
            `Failed to retrieving airline extras: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const deleteExtraById = async (
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

        return extra ? toExtraDTO(extra) : null;

    } catch(err){
        throw new Error(
            `Failed to delete extra: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};



export const getAirlinePassengerCount = async (
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


export const getAirlineMonthlyIncome = async (
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


export const getAirlineRouteCount = async (
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

export const getAirlineFlightsInProgressCount = async (
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


export const getAirlinesAircrafts = async (
    airlineId : number
) : Promise<AircraftDTO[]> => {
    try{

        const aircrafts : AircraftWithClasses[] = await prisma.aircrafts.findMany({
            where: {
                airline_id: airlineId,
                active: true
            },
            include: {
                aircraft_classes: true
            }
        });

        return aircrafts.map(toAircraftDTO);

    } catch(err){
        throw new Error(
            `Failed to creating aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const createAirlineAircraft = async (
    airlineId : number,
    aircraft : CreateAircraft,
    classes: Class[]
) : Promise<AircraftDTO> => {
    try{

        const newAircraft : aircrafts | null = await prisma.aircrafts.create({
            data: {
                airline_id: airlineId,
                model: aircraft.model,
                nSeats: aircraft.nSeats,
            }
        })

        if(!newAircraft)
            throw new Error("Aircraft creation failed");

        const newClasses : aircraft_classes[] = await createAircraftClasses(newAircraft.id, classes);

        return toAircraftDTO({
            ...newAircraft,
            aircraft_classes: newClasses
        })

    } catch(err){
        throw new Error(
            `Failed to creating aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export const createAircraftClasses = async (
    aircraftId : number,
    classes : Class[]
) : Promise<aircraft_classes[]> => {
    try{
        const aircraftClasses : aircraft_classes[] = await prisma.$transaction(
            classes.map(cls => 
                prisma.aircraft_classes.create({
                data: {
                    aircraft_id: aircraftId,
                    name: cls.name,
                    nSeats: cls.nSeats,
                    price_multiplier: cls.priceMultiplier
                }
                })
            )
        );

        return aircraftClasses

    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export const deleteAircraft = async (
    airlineId : number,
    aircraftId : number
) : Promise<aircrafts | null> => {
    try{
        
        const aircraft : aircrafts | null = await prisma.aircrafts.update({
            where : {
                id: aircraftId,
                airline_id: airlineId,
                active: true
            },
            data: {
                active: false,
                deletion_time: new Date(),
                aircraft_classes : {
                    updateMany: {
                        where: {
                            aircraft_id: aircraftId,
                            active: true
                        },
                        data: {
                            active: false,
                            deletion_time: new Date()
                        }
                    }
                }
            }
        });

        return aircraft;


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const getAircraftClasses = async (
    airlineId : number,
    aircraftId : number
) : Promise<ClassDTO[] | null> => {
    try{

        const classes : aircraft_classes[] = await prisma.aircraft_classes.findMany({
            where: {
                aircrafts : {
                    id: aircraftId,
                    airline_id: airlineId,
                    active: true
                },
                active: true
            },
            orderBy: {
                price_multiplier: 'desc'
            }
        })

        return classes.map(toClassDTO);


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const getAirlineAircraftById = async (
    airlineId : number,
    aircraftId : number
) : Promise<aircrafts | null> => {
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

        return aircraft; 

    } catch(err){
        throw new Error(
            `Failed to retrieving aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}

export const getAircraftById = async (
    aircraftId : number
) : Promise<aircrafts | null> => {
     try{
        
        const aircraft : aircrafts | null = await prisma.aircrafts.findUnique({
            where : {
                id: aircraftId,
                active: true
            }
        });

        if(!aircraft)
            return null;

        return aircraft; 

    } catch(err){
        throw new Error(
            `Failed to retrieving aircraft: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}


export const getRoutesMostInDemand = async (
    airlineId : number,
    nRoutes : number
) : Promise<RoutesMostInDemandDTO[]> => {
     try{
        
        const routes : RoutesMostInDemandDTO[] = await prisma.$queryRaw`
            SELECT 
                AR.route_id AS "routeId",
                Dep.name AS "departureAirportName",
                Arr.name AS "arrivalAirportName",
                CAST(COUNT(*) AS INT) AS "passengersCount"
            FROM Tickets T 
            JOIN Flights F ON T.flight_id = F.id 
            JOIN Aircrafts A ON F.aircraft_id = A.id
            JOIN public."airlineRoute" AR ON F.route_id = AR.route_id 
            JOIN Routes R ON R.id = AR.route_id
            JOIN Airports Dep ON R.departure_airport_id = Dep.id
            JOIN Airports Arr ON R.arrival_airport_id = Arr.id
            WHERE A.id =  ${airlineId}
            GROUP BY AR.route_id, Dep.name, Arr.name
            ORDER BY "passengersCount" DESC
            LIMIT ${nRoutes}
        `;
        
        return routes;

    } catch(err){
        throw new Error(
            `Failed to retrieving best routes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}

export const getAirlineMonthlyIncomesByYear = async (
    airlineId : number,
    year : number
) : Promise<MonthlyIncomeDTO[]> => {
     try{
        
        const monthlyIncomes : MonthlyIncomeDTO[] = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', T.purchase_date), 'YYYY-MM') AS "month",
                SUM(T.final_cost) AS "monthlyIncome"
            FROM Tickets T 
            JOIN Flights F ON T.flight_id = F.id 
            JOIN Aircrafts A ON F.aircraft_id = A.id
            WHERE A.airline_id = ${airlineId} 
                AND EXTRACT(YEAR FROM T.purchase_date) = ${year}
            GROUP BY DATE_TRUNC('month', T.purchase_date)
            ORDER BY "month" ASC;
        `;

        return monthlyIncomes;

    } catch(err){
        throw new Error(
            `Failed to retrieving best routes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}


// Flights

export const getAirlineFlights = async (
    airlineId : number
) : Promise<FlightInfoDTO[]> => {
     try{
        
        const flights : FlightInfo[] = await prisma.flights.findMany({
            where: {
                aircrafts: {
                    airline_id: airlineId
                }
            },
            include: {
                aircrafts: {
                    include: {
                        airlines: true
                    }
                },
                routes: {
                    include: {
                        departure_airport: true,
                        arrival_airport: true
                    }
                }
            }
        });

        return flights.map(toFlightInfoDTO);

    } catch(err){
        throw new Error(
            `Failed to retrieving airline flights: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}


export const createAirlineFlight = async (
    airlineId : number,
    flight : Flight
) : Promise<FlightInfoDTO> => {
     try{

        const aircraft : aircrafts | null = await getAirlineAircraftById(airlineId, flight.aircraftId);
        if(!aircraft)
            throw new Error("Aircraft not found or does not belong to the airline");

        const airlineRoute : airlineRoute | null = await getAirlineRoute(airlineId, flight.routeId);
        if(!airlineRoute)
            throw new Error("Route not found or does not belong to the airline");
        
        const newFlight : FlightInfo = await prisma.flights.create({
            data: {
                routes : {
                    connect : {
                        id: flight.routeId
                    }
                },
                aircrafts : {
                    connect : {
                        id: flight.aircraftId
                    }
                },
                departure_time: flight.departureTime,
                arrival_time: flight.arrivalTime,
                base_price: flight.basePrice,
                duration_seconds: flight.durationSeconds,
                nSeats_available: aircraft.nSeats,
                nSeats_total: aircraft.nSeats
            },
            include: {
                aircrafts: {
                    include: {
                        airlines: true
                    }
                },
                routes: {
                    include: {
                        departure_airport: true,
                        arrival_airport: true
                    }
                }
            }
        });

        return toFlightInfoDTO(newFlight);
    } catch(err){
        throw new Error(
            `Failed to retrieving airline flights: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}
