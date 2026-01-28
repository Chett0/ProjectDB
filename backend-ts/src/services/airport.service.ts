import { airports } from '@prisma/client';
import prisma from '../config/db';
import { AirportDTO, CitiesDTO, toAirportDTO, toCitiesDTO } from '../dtos/airport.dto';

export const getAirportByCode = async (
    code : string
) : Promise<AirportDTO | null> => {
    try{
        const airport : airports | null = await prisma.airports.findFirst({
            where: {
                iata: code,
                active: true
            }
        })

        return airport ? toAirportDTO(airport) : null;

    } catch(err){
        throw new Error(
            `Failed to retrieving airport: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export const getAirportsByCity = async (
    city : string
) : Promise<airports[]> => {
    try{
        const airports : airports[] = await prisma.airports.findMany({
            where: {
                city: {
                    contains: city,
                    mode: "insensitive"
                },
                active: true
            }
        })

        return airports;

    } catch(err){
        throw new Error(
            `Failed to retrieving airport: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export const getAirportsCities = async () : Promise<CitiesDTO[]> => {

    const cities : { city: string }[] = await prisma.airports.findMany({
        select: {
            city: true
        },
        distinct: ['city'],
        orderBy: {
            city: 'asc',
        },
    });

    return cities.map(toCitiesDTO);
}

