import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';

export const createAirport = async (airport : airports) => {
    airport.active = true;
    return prisma.airports.create({
        data: airport,
    });
}

