// import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';

export const createAirport = async (airportData : any) => {
    return prisma.airport.create({
        data: airportData,
    });
}

