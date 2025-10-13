import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';

export const createAirport = async (airportData : airports) => {
    return prisma.airports.create({
        data: airportData,
    });
}

