import { airports } from '@prisma/client';
import prisma from '../config/db';
import { AirportDTO, CitiesDTO } from '../dtos/airport.dto';

// const createAirport = async (airport : airports) => {
//     airport.active = true;
//     return prisma.airports.create({
//         data: airport,
//     });
// }

const getAirportByCode = async (
    code : string
) : Promise<AirportDTO | null> => {
    try{
        const airport : airports | null = await prisma.airports.findFirst({
            where: {
                iata: code,
                active: true
            }
        })

        return airport ? AirportDTO.fromPrisma(airport) : null;

    } catch(err){
        throw new Error(
            `Failed to retrieving airport: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getAirportsByCity = async (
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

const getAirportsCities = async () : Promise<CitiesDTO> => {
    try{
        const cities = await prisma.airports.findMany({
            select: {
                city: true,
            },
            distinct: ['city'],
            orderBy: {
                city: 'asc',
            },
        });

        return new CitiesDTO(cities.map(c => c.city));
    } catch(err){
        throw new Error(
            `Failed to retrieving cities: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}

export {
    // createAirport,
    getAirportByCode,
    getAirportsByCity,
    getAirportsCities
}

