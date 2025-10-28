import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';
import { AirportDTO } from '../dtos/airport.dto';

const createAirport = async (airport : airports) => {
    airport.active = true;
    return prisma.airports.create({
        data: airport,
    });
}

const getAirportByCode = async (
    code : string
) : Promise<AirportDTO | null> => {
    try{
        const airport : airports | null = await prisma.airports.findFirst({
            where: {
                code: code,
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

export {
    createAirport,
    getAirportByCode,
    getAirportsByCity
}

