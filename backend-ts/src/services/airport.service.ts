import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';

const createAirport = async (airport : airports) => {
    airport.active = true;
    return prisma.airports.create({
        data: airport,
    });
}

const getAirportByCode = async (
    code : string
) : Promise<airports | null> => {
    try{
        const airport : airports | null = await prisma.airports.findFirst({
            where: {
                code: code,
                active: true
            }
        })

        return airport;

    } catch(err){
        throw new Error(
            `Failed to retrieving airport: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    createAirport,
    getAirportByCode
}

