import { airports } from '../../prisma/generated/prisma';
import prisma from '../config/db';

const createAirport = async (airport : airports) => {
    airport.active = true;
    return prisma.airports.create({
        data: airport,
    });
}

export {
    createAirport
}

