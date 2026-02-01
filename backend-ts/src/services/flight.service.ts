import { airports, flights, seatstate } from '@prisma/client';
import prisma from "../config/db";
import { Flight, FlightInfo, SearchFlightsParams } from "../types/flight.types";
import * as airportService from "../services/airport.service";
import * as airlineService from "../services/airline.service";
import { JourneysInfoDTO, SeatsDTO, toFlightInfoDTO } from "../dtos/flight.dto";
import { Decimal } from "@prisma/client/runtime/library";
import { AircraftDTO } from "../dtos/airline.dto";
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const MINIMUM_CONNECTION_SECONDS = 2 * 3600;
const MAXIMUM_CONNECTION_SECONDS = 12 * 3600;

export const createFlight = async (
    flight: Flight
) : Promise<flights | null> => {

    const aircraft : AircraftDTO | null = await airlineService.getAirlineAircraftWithClassesById(flight.airlineId, flight.aircraftId);
    if(!aircraft)
        throw new NotFoundError("Aircraft not found");

    const isAirlineRoutePresent : Boolean = await airlineService.existAirlineRoute(flight.airlineId, flight.routeId);
    if(!isAirlineRoutePresent)
        throw new NotFoundError("Airline route not found");

    let letter : string = 'A';
    let rowNumber : number = 1;

    let seatsData : Omit<Prisma.seatsCreateManyInput, 'flight_id'>[] = [];

    for(const cls of aircraft.classes){
        for(let p = 1; p < cls.nSeats; p++){
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
    
    const newFlight : flights | null = await prisma.$transaction(async(tx) => {

        const result : flights = await tx.flights.create({
            data: {
                departure_time: flight.departureTime,
                arrival_time: flight.arrivalTime,
                aircraft_id: flight.aircraftId,
                route_id: flight.routeId,
                base_price: flight.basePrice,
                nSeats_total: aircraft.nSeats,
                nSeats_available: aircraft.nSeats,
                duration_seconds: flight.durationSeconds,
                seats : {
                    createMany: {
                        data: seatsData
                    }
                }
            }
        });

        return result;
        
    });

    return newFlight;
};


export const getFlightbyId = async (
    flightId: number
) : Promise<flights | null> => {
    try{
        
        const flight : flights | null = await prisma.flights.findUnique({
            where : {
                id: flightId,
                active: true
            }
        });

        return flight;


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


export const searchFlights = async (
    params : SearchFlightsParams
) : Promise<JourneysInfoDTO[]> => {
    const departure_airports : airports[] = await airportService.getAirportsByCity(params.departureAirportCity);
    if(departure_airports.length == 0)
        throw new NotFoundError("Departure airports not found");
    
    const arrival_airports : airports[] = await airportService.getAirportsByCity(params.arrivalAirportCity);
    if(arrival_airports.length == 0)
        throw new NotFoundError("Arrival airports not found");

    console.log(params)

    const journeys : JourneysInfoDTO[] = await getJourneys(
        departure_airports,
        arrival_airports,
        params
    )

    return journeys;
};

const getJourneys = async (
    departureAirports : airports[],
    arrivalAirports : airports[],
    params : SearchFlightsParams
) : Promise<JourneysInfoDTO[]> => {
    let journeys : JourneysInfoDTO[] = [];

    const startOfDay : Date = new Date(`${params.departureDate}T00:00:00.000Z`);
    const endOfDay : Date = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    const departureAirportIds : number[] = departureAirports.map(d => d.id);
    const arrivalAirportsIds : number[] = arrivalAirports.map(a => a.id);

    const directFlights : FlightInfo[] = await prisma.flights.findMany({
        where: {
            routes : {
                departure_airport_id : { in : departureAirportIds },
                arrival_airport_id: { in : arrivalAirportsIds }
            },
            base_price: { 
                lt: params.maxPrice 
            },
            departure_time: {
                gt: startOfDay,
                lt: endOfDay
            }
        },
        include : {
            aircrafts: {
                include : {
                    airlines: true
                }
            },
            routes: {
                include: {
                    arrival_airport: true,
                    departure_airport: true
                }
            }
        }
    });

    for(const flight of directFlights){   
        journeys.push({
            firstFlight: toFlightInfoDTO(flight),
            secondFlight: null,
            totalDuration: flight.duration_seconds,
            totalPrice: flight.base_price
        });
    };

    if(params.nStops >= 1){

        const [firstFlights, secondFlights] : [FlightInfo[], FlightInfo[]] = await Promise.all([
            prisma.flights.findMany({
                where : {
                    routes : {
                        departure_airport_id : { in : departureAirportIds, notIn: arrivalAirportsIds }
                    },
                    departure_time: {
                        gt: startOfDay,
                        lt: endOfDay
                    }
                },
                include : {
                    routes : {
                        include: {
                            departure_airport: true,
                            arrival_airport: true
                        }
                    },
                    aircrafts: {
                        include : {
                            airlines: true
                        }
                    }
                }
            }), 

            prisma.flights.findMany({
                where : {
                    routes : {
                        arrival_airport_id : { in : arrivalAirportsIds, notIn: departureAirportIds }
                    },
                    departure_time: {
                        gt: startOfDay,
                        lt: endOfDay
                    }
                },
                include : {
                    routes : {
                        include: {
                            departure_airport: true,
                            arrival_airport: true
                        }
                    },
                    aircrafts: {
                        include : {
                            airlines: true
                        }
                    }
                }
            })
        ]);

        for(const firstFlight of firstFlights){
            for(const secondFlight of secondFlights){

                if(firstFlight.routes.arrival_airport_id == secondFlight.routes.departure_airport_id){

                    const layoversTimeSeconds : number = (secondFlight.departure_time.getTime() - firstFlight.arrival_time.getTime()) / 1000;

                    if(layoversTimeSeconds >= MINIMUM_CONNECTION_SECONDS && layoversTimeSeconds <= MAXIMUM_CONNECTION_SECONDS){

                        const totalJourneyDuration : number =  (secondFlight.arrival_time.getTime() - firstFlight.departure_time.getTime()) / 1000;
                        const totalPrice : Decimal = firstFlight.base_price.add(secondFlight.base_price);

                        if(totalPrice.lte(params.maxPrice)){

                            journeys.push({
                                firstFlight: toFlightInfoDTO(firstFlight),
                                secondFlight: toFlightInfoDTO(secondFlight),
                                totalDuration: totalJourneyDuration,
                                totalPrice: totalPrice
                            });

                        }
                    }
                }
            }
        }
    }

    journeys.sort((a, b) => {
        if(params.sort.sortBy === 'total_duration')
            return params.sort.order === 'asc' ? a.totalDuration - b.totalDuration : b.totalDuration - a.totalDuration;
        else if(params.sort.sortBy === 'total_price')
            return params.sort.order === 'asc' ? a.totalPrice.sub(b.totalPrice).toNumber() : b.totalPrice.sub(a.totalPrice).toNumber();
        else if(params.sort.sortBy === 'departure_time')
            return params.sort.order === 'asc' ? a.firstFlight.departureTime.getTime() - b.firstFlight.departureTime.getTime() : b.firstFlight.departureTime.getTime() - a.firstFlight.departureTime.getTime();
        else if(params.sort.sortBy === 'arrival_time')
            return params.sort.order === 'asc' ? a.firstFlight.arrivalTime.getTime() - b.firstFlight.arrivalTime.getTime() : b.firstFlight.arrivalTime.getTime() - a.firstFlight.arrivalTime.getTime();
        return 0;
    })

    return journeys;
};


export const getFlightSeats = async (
    flightId: number
) : Promise<SeatsDTO[]> => {

    const seats : SeatsDTO[] = await prisma.$queryRaw`
        SELECT 
            S.id, 
            S.number,
            S.state,
            S.price,
            json_build_object(
                'id', AC.id,
                'name', AC.name,
                'nSeats', AC."nSeats",
                'priceMultiplier', AC.price_multiplier
            ) AS "class"
        FROM Seats S 
        JOIN Flights F ON F.id = S.flight_id
        JOIN public.aircraft_classes AC ON F.aircraft_id = AC.aircraft_id 
        WHERE S.flight_id = ${flightId}
        ORDER BY id ASC
    `;

    return seats;
}; 


