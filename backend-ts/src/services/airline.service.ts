import { aircraft_classes, aircrafts, airlineRoute, airlines, extras, seatstate } from '@prisma/client';
import prisma from "../config/db";
import { AircraftDTO, ClassDTO, ExtraDTO, MonthlyIncomeDTO, RouteDTO, RoutesMostInDemandDTO, toAircraftDTO, toClassDTO, toExtraDTO, toRouteDTO } from "../dtos/airline.dto";
import { AirlineDTO, toAirlineDTO } from "../dtos/user.dto";
import { AircraftWithClasses, AirlineRoute, Class, CreateAircraft, Extra, Route } from "../types/airline.types";
import { FlightInfoDTO, toFlightInfoDTO } from '../dtos/flight.dto';
import { Flight, FlightInfo } from '../types/flight.types';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

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

    const passengers = await prisma.tickets.findMany({
        where: {
            flights: {
                aircrafts: {
                    airline_id: airlineId
                }
            }
        },
        distinct: ['passenger_id'],
        select: {
            passenger_id: true
        }
    });
    return passengers.length;
};


export const getAirlineTotalIncome = async (
    airlineId : number
) : Promise<number> => {
    
    const result = await prisma.tickets.aggregate({
        _sum:{
            final_cost: true
        },
        where:{
            flights:{
                aircrafts:{
                    airline_id: airlineId
                }
            }
        }
    });

    // toNumber() needed for convertion from decimal
    return result._sum.final_cost?.toNumber() ?? 0;

};


export const getAirlineRouteCount = async (
    airlineId : number
) : Promise<number> => {

    const routeCount = await prisma.airlineRoute.count({
        where: {
            airline_id: airlineId
        }
    });

    return routeCount;

};

export const getAirlineFlightsInProgressCount = async (
    airlineId : number
) : Promise<number> => {

    const now : Date = new Date();

    const fligthsCount = await prisma.flights.count({
        where:{
            aircrafts: {
                airline_id: airlineId
            },
            departure_time:{
                lte: now
            },
            arrival_time:{
                gte: now
            }
        }
    });

    return fligthsCount;

};

export const getRoutesMostInDemand = async (
    airlineId : number,
    nRoutes : number
) : Promise<RoutesMostInDemandDTO[]> => {

    const routes : RoutesMostInDemandDTO[] = await prisma.$queryRaw`
        SELECT 
        R.id AS "routeId",
        Dep.iata AS "departureAirportCode",
        Arr.iata AS "arrivalAirportCode",
        CAST(COUNT(T.id) AS INT) AS "passengersCount"
        FROM tickets T 
        JOIN flights F ON T.flight_id = F.id 
        JOIN aircrafts A ON F.aircraft_id = A.id
        JOIN routes R ON F.route_id = R.id
        JOIN airports Dep ON R.departure_airport_id = Dep.id
        JOIN airports Arr ON R.arrival_airport_id = Arr.id
        WHERE A.airline_id = ${airlineId}
        AND T.state = 'CONFIRMED'
        GROUP BY R.id, Dep.iata, Arr.iata
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
            },
            flights : {
                updateMany: {
                    where: {
                        aircraft_id: aircraftId,
                        active: true,
                        departure_time: {
                            gt: new Date()
                        }
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

export const getAirlineFlightsPaginated = async (
    airlineId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { q?: string; maxPrice?: number; sortBy?: string; order?: string }
) : Promise<{ flights: FlightInfoDTO[]; total: number }> => {

    const where: any = {
        aircrafts: {
            airline_id: airlineId
        }
    };

    if (filters?.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))) {
        where.base_price = { lte: Number(filters.maxPrice) };
    }

    if (filters?.q) {
        const q = String(filters.q).trim();
        if (q.length > 0) {
            where.OR = [
                { routes: { departure_airport: { name: { contains: q, mode: 'insensitive' } } } },
                { routes: { departure_airport: { city: { contains: q, mode: 'insensitive' } } } },
                { routes: { departure_airport: { iata: { contains: q, mode: 'insensitive' } } } },
                { routes: { arrival_airport: { name: { contains: q, mode: 'insensitive' } } } },
                { routes: { arrival_airport: { city: { contains: q, mode: 'insensitive' } } } },
                { routes: { arrival_airport: { iata: { contains: q, mode: 'insensitive' } } } }
            ];
        }
    }

    let orderBy: any = { departure_time: 'desc' };
    if (filters?.sortBy) {
        const order = (filters.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
        switch (filters.sortBy) {
            case 'total_price':
            case 'base_price':
                orderBy = { base_price: order };
                break;
            case 'departure_time':
                orderBy = { departure_time: order };
                break;
            case 'arrival_time':
                orderBy = { arrival_time: order };
                break;
            case 'total_duration':
            default:
                orderBy = { duration_seconds: order };
                break;
        }
    }

    const total = await prisma.flights.count({ where });

    const flights: FlightInfo[] = await prisma.flights.findMany({
        where,
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
        },
        skip: (Math.max(1, page) - 1) * limit,
        take: limit,
        orderBy
    });

    return { flights: flights.map(toFlightInfoDTO), total };
}

/* old method without seat creation
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
*/

export const createAirlineFlight = async (
    flight: Flight
): Promise<FlightInfoDTO> => {

    const aircraft : AircraftDTO | null = await getAirlineAircraftWithClassesById(flight.airlineId, flight.aircraftId);
    if(!aircraft)
        throw new Error("Aircraft not found");
        
    const isAirlineRoutePresent : Boolean = await existAirlineRoute(flight.airlineId, flight.routeId);
    if(!isAirlineRoutePresent)
        throw new NotFoundError("Airline route not found");

    let letter: string = 'A';
    let rowNumber: number = 1;
    let seatsData : Omit<Prisma.seatsCreateManyInput, 'flight_id'>[] = []; 

    for(const cls of aircraft.classes){
            for(let p = 0; p < cls.nSeats; p++){
                seatsData.push({
                    number: `${rowNumber}${letter}`,
                    class_id: cls.id,
                    state: seatstate.AVAILABLE,
                    price: flight.basePrice * cls.priceMultiplier 
                })
    
                letter = String.fromCharCode(letter.charCodeAt(0) + 1);
                if (letter === 'G') {
                    rowNumber += 1;
                    letter = 'A';
                }
            }
        }

    const newFlight = await prisma.$transaction(async (tx) => {
        
        const created = await tx.flights.create({
            data: {
                routes: { connect: { id: flight.routeId } },
                aircrafts: { connect: { id: flight.aircraftId } },
                departure_time: flight.departureTime,
                arrival_time: flight.arrivalTime,
                base_price: flight.basePrice,
                duration_seconds: flight.durationSeconds,
                nSeats_available: aircraft.nSeats,
                nSeats_total: aircraft.nSeats,
                seats: {
                    createMany: {
                        data: seatsData
                    }
                }
            },
            include: {
                aircrafts: { include: { airlines: true } },
                routes: { include: { departure_airport: true, arrival_airport: true } }
            }
        });

        return created;
    });

    return toFlightInfoDTO(newFlight);
}

//#endregion