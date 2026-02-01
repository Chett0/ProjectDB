import { aircraft_classes, aircrafts, airlineRoute, airlines, extras } from '@prisma/client';
import prisma from "../config/db";
import { AircraftDTO, ClassDTO, ExtraDTO, MonthlyIncomeDTO, RouteDTO, RoutesMostInDemandDTO, toAircraftDTO, toClassDTO, toExtraDTO, toRouteDTO } from "../dtos/airline.dto";
import { AirlineDTO, toAirlineDTO } from "../dtos/user.dto";
import { AircraftWithClasses, AirlineRoute, Class, CreateAircraft, Extra, Route } from "../types/airline.types";
import { FlightInfoDTO, toFlightInfoDTO } from '../dtos/flight.dto';
import { Flight, FlightInfo } from '../types/flight.types';
import { NotFoundError } from '../utils/errors';

//#region Airline Info

export const getAirlineById = async (
    airlineId : number
) : Promise<AirlineDTO | null> => {

    const airline : airlines | null = await prisma.airlines.findUnique({
        where: {
            id: airlineId
        }
    })

    return airline ? toAirlineDTO(airline) : null;
};

//#region Airline dashboard

export const getAirlinePassengerCount = async (
    airlineId : number
) : Promise<number> => {

    const result = await prisma.$queryRaw<[{ passengerCount: bigint | number }]>`
        SELECT COUNT(DISTINCT T.passenger_id) as "passengerCount"
        FROM Tickets T 
        JOIN Flights F ON T.flight_id = F.id
        JOIN Aircrafts A ON F.aircraft_id = A.id
        WHERE A.airline_id = ${airlineId}
    `;
    
    const passengerCount : number = result.length > 0 ? Number(result[0].passengerCount) : 0;
    return passengerCount;
};


export const getAirlineMonthlyIncome = async (
    airlineId : number
) : Promise<number> => {

    const now = new Date();
    const startOfMonth : Date = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await prisma.$queryRaw<[{ monthlyIncome: bigint | number }]>`
        SELECT COALESCE(SUM(T.final_cost), 0) as "monthlyIncome"
        FROM Tickets T 
        JOIN Flights F ON T.flight_id = F.id
        JOIN Aircrafts A ON F.aircraft_id = A.id
        WHERE 
            A.airline_id = ${airlineId} AND
            T.purchase_date >= ${startOfMonth} AND
            T.purchase_date <= ${endOfMonth}

    `;

    const monthlyIncome : number = result.length > 0 ? Number(result[0].monthlyIncome) : 0;
    return monthlyIncome as number;
};


export const getAirlineRouteCount = async (
    airlineId : number
) : Promise<number> => {

    const result = await prisma.$queryRaw<[{ activeRoutes: bigint | number }]>`
        SELECT COUNT(DISTINCT AR.route_id) as "activeRoutes"
        FROM public."airlineRoute" AR
        WHERE AR.airline_id = ${airlineId}
    `;

    const airlineRouteCount : number = result.length > 0 ? Number(result[0].activeRoutes) : 0;
    return airlineRouteCount;
};

export const getAirlineFlightsInProgressCount = async (
    airlineId : number
) : Promise<number> => {

    const now : Date = new Date();
    const result = await prisma.$queryRaw<[{ flightsInProgress: bigint | number }]>`
        SELECT COUNT(DISTINCT F.id) as "flightsInProgress"
        FROM Flights F
        JOIN Aircrafts A ON F.aircraft_id = A.id
        WHERE 
            A.airline_id = ${airlineId} AND
            F.departure_time <= ${now} AND
            F.arrival_time >= ${now}
    `;

    const filghtsInProgressCount : number = result.length > 0 ? Number(result[0].flightsInProgress) : 0;
    return filghtsInProgressCount;
};

export const getRoutesMostInDemand = async (
    airlineId : number,
    nRoutes : number
) : Promise<RoutesMostInDemandDTO[]> => {

    const routes : RoutesMostInDemandDTO[] = await prisma.$queryRaw`
        SELECT 
            AR.route_id AS "routeId",
            Dep.iata AS "departureAirportCode",
            Arr.iata AS "arrivalAirportCode",
            CAST(COUNT(*) AS INT) AS "passengersCount"
        FROM Tickets T 
        JOIN Flights F ON T.flight_id = F.id 
        JOIN Aircrafts A ON F.aircraft_id = A.id
        JOIN public."airlineRoute" AR ON F.route_id = AR.route_id 
        JOIN Routes R ON R.id = AR.route_id
        JOIN Airports Dep ON R.departure_airport_id = Dep.id
        JOIN Airports Arr ON R.arrival_airport_id = Arr.id
        WHERE A.id =  ${airlineId}
        GROUP BY AR.route_id, Dep.iata, Arr.iata
        ORDER BY "passengersCount" DESC
        LIMIT ${nRoutes}
    `;
    
    return routes;
}

export const getAirlineMonthlyIncomesByYear = async (
    airlineId : number,
    year : number
) : Promise<MonthlyIncomeDTO[]> => {

    const monthlyIncomes : MonthlyIncomeDTO[] = await prisma.$queryRaw`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', T.purchase_date), 'YYYY-MM') AS "month",
            SUM(T.final_cost) AS "income"
        FROM Tickets T 
        JOIN Flights F ON T.flight_id = F.id 
        JOIN Aircrafts A ON F.aircraft_id = A.id
        WHERE A.airline_id = ${airlineId} 
            AND EXTRACT(YEAR FROM T.purchase_date) = ${year}
        GROUP BY DATE_TRUNC('month', T.purchase_date)
        ORDER BY "month" ASC;
    `;

    return monthlyIncomes;
}

//#endregion
//#endregion

//#region Airline routes

export const getAirlineRoutes = async (
    airlineId : number
) : Promise<RouteDTO[]> => {

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

    return routes.map(toRouteDTO);
};


export const createAirlineRoute = async (
    airlineId : number,
    departureAirportCode : string,
    arrivalAirportCode : string
) : Promise<RouteDTO> => {

    let existingRoute : Route | null = await getRouteByAirportsCode(departureAirportCode, arrivalAirportCode);

    const newAirlineRoute : RouteDTO  = await prisma.$transaction(async(tx) => {

        if(!existingRoute){
            const newRoute : Route = await tx.routes.create({
                data : {
                    departure_airport : {
                        connect : {
                            iata : departureAirportCode
                        }
                    },
                    arrival_airport : {
                        connect : {
                            iata: arrivalAirportCode
                        }
                    }
                },
                include : {
                    departure_airport: true,
                    arrival_airport: true
                }
            });

            existingRoute = newRoute;
        }

        await tx.airlineRoute.upsert({
            where: {
                airline_id_route_id: {
                    airline_id: airlineId,
                    route_id: existingRoute.id
                }
            },
            update: {
                active: true
            },
            create : {
                airline_id: airlineId,
                route_id: existingRoute.id
            }
        })

        return toRouteDTO(existingRoute);
    });

    return newAirlineRoute;
};

export const getRouteByAirportsCode = async (
    departureAirportCode : string,
    arrivalAirportCode : string
) : Promise<Route | null> => {
    const route : Route | null = await prisma.routes.findFirst({
        where: {
            departure_airport : {
                iata : departureAirportCode
            },
            arrival_airport : {
                iata: arrivalAirportCode
            }
        },
        include : {
            departure_airport: true,
            arrival_airport: true
        }
    })

    return route;
};

export const getAirlineRouteById = async (
    airlineId: number,
    routeId: number
) : Promise<RouteDTO | null> => {
    const airlineRoute : AirlineRoute | null = await prisma.airlineRoute.findFirst({
        where : {
            airline_id: airlineId,
            route_id: routeId,
            active: true
        },
        include : {
            routes : {
                include : {
                    departure_airport: true,
                    arrival_airport: true
                }
            }
        }
    });

    return airlineRoute ? toRouteDTO(airlineRoute) : null;
};

export const getAirlineRoute = async (
    airlineId : number,
    routeId : number
) : Promise<airlineRoute | null> => {

    const airlineRoute : airlineRoute | null = await prisma.airlineRoute.findFirst({
        where: {
            airline_id : airlineId,
            route_id: routeId
        }
    })

    return airlineRoute;
};

export const existAirlineRoute = async (
    airlineId : number,
    routeId : number
) : Promise<boolean> => {
    const record = await prisma.airlineRoute.findFirst({
        where: {
            airline_id : airlineId,
            route_id: routeId
        }
    })

    return record !== null;
};


export const deleteAirlineRouteById = async (
    airlineId : number,
    routeId : number
) : Promise<airlineRoute | null> => {

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
    });

    return airlineRoute;

};

//#endregion

//#region Extras

export const createExtra = async (
    extra : Extra
) : Promise<ExtraDTO> => {

    const newExtra : extras = await prisma.extras.create({
        data: {
            name: extra.name,
            price: extra.price,
            airlines : {
                connect : {
                    id: extra.airlineId
                }
            }
        }
    });

    return toExtraDTO(newExtra);
};


export const getAirlineExtras = async (
    airlineId : number
) : Promise<ExtraDTO[]> => {

    const extras : extras[] = await prisma.extras.findMany({
        where: {
            airline_id: airlineId,
            active: true
        }
    });

    return extras.map(toExtraDTO);
};


export const deleteExtraById = async (
    airlineId : number,
    extraId: number
) : Promise<ExtraDTO | null> => {
    
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

};

//#endregion

//#region Aircrafts

export const getAirlinesAircrafts = async (
    airlineId : number
) : Promise<AircraftDTO[]> => {
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
};

export const getAirlineAircraftWithClassesById = async (
    airlineId : number,
    aircraftId : number
) : Promise<AircraftDTO | null> => {

    const aircraft : AircraftWithClasses | null = await prisma.aircrafts.findUnique({
        where: {
            airline_id: airlineId,
            id: aircraftId,
            active: true
        },
        include: {
            aircraft_classes: true
        }
    });

    return aircraft ? toAircraftDTO(aircraft) : null;
};


export const createAirlineAircraft = async (
    aircraft : CreateAircraft
) : Promise<AircraftDTO> => {

    const newAircraft : aircrafts = await prisma.aircrafts.create({
        data: {
            airline_id: aircraft.airlineId,
            model: aircraft.model,
            nSeats: aircraft.nSeats,
        }
    });

    const newClasses : aircraft_classes[] = await createAircraftClasses(
        newAircraft.id, 
        aircraft.classes
    );

    return toAircraftDTO({
        ...newAircraft,
        aircraft_classes: newClasses
    })
};

const createAircraftClasses = async (
    aircraftId : number,
    classes : Class[]
) : Promise<aircraft_classes[]> => {

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

    return aircraftClasses;
};

export const deleteAircraft = async (
    airlineId : number,
    aircraftId : number
) : Promise<aircrafts | null> => {
        
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
};


export const getAirlineAircraftClasses = async (
    airlineId : number,
    aircraftId : number
) : Promise<ClassDTO[]> => {
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
        },
        include : {
            aircrafts: true
        }
    })

    return classes.map(toClassDTO);
};

export const getAircraftClassesByAircraftId = async (
    aircraftId : number
) : Promise<ClassDTO[]> => {
    const classes : aircraft_classes[] = await prisma.aircraft_classes.findMany({
        where: {
            aircrafts : {
                id: aircraftId,
                active: true
            },
            active: true
        },
        orderBy: {
            price_multiplier: 'desc'
        }
    })

    return classes.map(toClassDTO);
};

const getAirlineAircraftById = async (
    airlineId : number,
    aircraftId : number
) : Promise<aircrafts | null> => {
    const aircraft : aircrafts | null = await prisma.aircrafts.findUnique({
        where: {
            id: aircraftId,
            airline_id: airlineId,
            active: true
        }
    });

    return aircraft;
};

//#endregion

//#region Flights

export const getAirlineFlights = async (
    airlineId : number
) : Promise<FlightInfoDTO[]> => {
        
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

}


export const createAirlineFlight = async (
    flight : Flight
) : Promise<FlightInfoDTO> => {

    const aircraft : aircrafts | null = await getAirlineAircraftById(flight.airlineId, flight.aircraftId);
    if(!aircraft)
        throw new Error("Aircraft not found or does not belong to the airline");

    const airlineRoute : boolean = await existAirlineRoute(flight.airlineId, flight.routeId)
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
}

//#endregion