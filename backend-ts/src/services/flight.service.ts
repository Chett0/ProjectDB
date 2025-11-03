import { aircraft_classes, aircrafts, airports, flights, routes, seats, seatstate } from "../../prisma/generated/prisma";
import prisma from "../config/db";
import { Flight, SearchFlightsParams } from "../types/flight.types";
import * as airportService from "../services/airport.service";
import * as airlineService from "../services/airline.service";
import { FlightInfoDTO, JourneysInfoDTO, SeatsDTO } from "../dtos/flight.dto";
import { Decimal } from "@prisma/client/runtime/library";
import { ClassDTO } from "../dtos/airline.dto";

const MINIMUM_CONNECTION_SECONDS = 2 * 3600;
const MAXIMUM_CONNECTION_SECONDS = 12 * 3600;

const createFlight = async (
    flight: Flight,
    aircraftClasses: ClassDTO[]
) : Promise<flights | null> => {
    try{

        const aircraft : aircrafts | null = await airlineService.getAircraftById(flight.aircraftId);
        if(!aircraft)
            return null;
        
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
                    duration_seconds: flight.durationSeconds
                }
            });

            let letter : string = 'A';
            let rowNumber : number = 1;

            for(const cls of aircraftClasses){
                for(let p = 1; p < cls.nSeats; p++){
                    const seat : seats = await tx.seats.create({
                        data: {
                            number: rowNumber.toString() + letter,
                            flight_id: result.id,
                            class_id: cls.id,
                            state: seatstate.AVAILABLE,
                            price: flight.basePrice * cls.priceMultiplier 
                        }
                    })

                    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
                    if (letter === 'G') {
                        rowNumber += 1;
                        letter = 'A';
                    }
                }
            }

            return result;
            
        });

        return newFlight;

    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getFlightbyId = async (
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


const searchFlights = async (
    params : SearchFlightsParams
) : Promise<JourneysInfoDTO[]> => {
    try{
        
        const departure_airports : airports[] = await airportService.getAirportsByCity(params.departureAiportCity);
        if(departure_airports.length == 0)
            throw new Error("Departure airports not found");
        
        const arrival_airports : airports[] = await airportService.getAirportsByCity(params.arrivalAirportCity);
        if(arrival_airports.length == 0)
            throw new Error("Arrival airports not found");

        const journeys : JourneysInfoDTO[] = await getJourneys(
            departure_airports,
            arrival_airports,
            params
        )

        return journeys;

    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getJourneys = async (
    departureAirports : airports[],
    arrivalAirports : airports[],
    params : SearchFlightsParams
) : Promise<JourneysInfoDTO[]> => {
    try{

        let journeys : JourneysInfoDTO[] = [];

        const startOfDay : Date = new Date(`${params.departureDate}T00:00:00.000Z`);
        const endOfDay : Date = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        const directRoutes : routes[] = [];
        let currRoutes;
        
        for(const depAirport of departureAirports){
            for(const arrAirport of arrivalAirports){
                currRoutes = await airlineService.getRouteByAirports(
                    depAirport.id,
                    arrAirport.id
                )
                if(currRoutes)
                    directRoutes.push(currRoutes);
            }
        }

        const routeIds : number[] = directRoutes.map(r => r.id);
        const directFlights : flights[] = await prisma.flights.findMany({
            where: {
                route_id: { 
                    in: routeIds 
                },
                base_price: { 
                    lt: params.maxPrice 
                },
                departure_time: {
                    gt: startOfDay,
                    lt: endOfDay
                }
            }
        });

        for(const flight of directFlights){
            journeys.push(new JourneysInfoDTO(
                FlightInfoDTO.fromPrisma(flight),
                null,
                flight.duration_seconds,
                flight.base_price
            ))
        };

        if(params.layovers){

            const departureAirportIds : number[] = departureAirports.map(d => d.id);
            const arrivalAirportsIds : number[] = arrivalAirports.map(a => a.id);

            const departureRoutes : routes[] = await airlineService.getRouteByAirportsIds(departureAirportIds, true);
            const arrivalRoutes : routes[] = await airlineService.getRouteByAirportsIds(arrivalAirportsIds, false);

            for(const depRoute of departureRoutes){
                for(const arrRoute of arrivalRoutes){
                    if(depRoute.arrival_airport_id == arrRoute.departure_airport_id){

                        const firstFlights : flights[] = await prisma.flights.findMany({
                            where: {
                                route_id: depRoute.id,
                                departure_time: {
                                    gt: startOfDay,
                                    lt: endOfDay
                                }
                            }
                        });
                        const secondFlights : flights[] = await prisma.flights.findMany({
                            where: {
                                route_id: arrRoute.id,
                                departure_time: {
                                    gt: startOfDay,
                                    lt: endOfDay
                                }
                            }
                        });

                        for(const firstFlight of firstFlights){
                            for(const secondFlight of secondFlights){

                                const layoversTimeSeconds : number = (secondFlight.departure_time.getTime() - firstFlight.arrival_time.getTime()) / 1000;
                                if(layoversTimeSeconds >= MINIMUM_CONNECTION_SECONDS && layoversTimeSeconds <= MAXIMUM_CONNECTION_SECONDS){
                                    const totalJourneyDuration : number =  (secondFlight.arrival_time.getTime() - firstFlight.departure_time.getTime()) / 1000;
                                    const totalPrice : Decimal = firstFlight.base_price.add(secondFlight.base_price);
                                    if(totalPrice.lte(params.maxPrice)){

                                        journeys.push(new JourneysInfoDTO(
                                            FlightInfoDTO.fromPrisma(firstFlight),
                                            FlightInfoDTO.fromPrisma(secondFlight),
                                            totalJourneyDuration,
                                            totalPrice
                                        ));

                                    }
                                }

                            }
                        }

                    }
                }
            }
        }

        return journeys;

    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getFlightSeats = async (
    flightId: number
) : Promise<SeatsDTO[]> => {
    try{

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


    } catch(err){
        throw new Error(
            `Failed to retrieving flight seats: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}; 



export {
    getFlightbyId,
    searchFlights,
    getFlightSeats,
    createFlight
}