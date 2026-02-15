import { airports } from '@prisma/client';
import prisma from '../config/db';
import { AirportDTO, CityDTO, toAirportDTO, toCityDTO } from '../dtos/airport.dto';

export const getAirportByCode = async (
    code : string
) : Promise<AirportDTO | null> => {

    const airport : airports | null = await prisma.airports.findFirst({
        where: {
            iata: code,
            active: true
        }
    })

    return airport ? toAirportDTO(airport) : null;

};

export const getAirportsByCity = async (
    city : string
) : Promise<airports[]> => {

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

};

export const getAirportsCities = async () : Promise<CityDTO[]> => {

    const cities : { city: string }[] = await prisma.airports.findMany({
        select: {
            city: true
        },
        distinct: ['city'],
        orderBy: {
            city: 'asc',
        },
    });

    return cities.map(toCityDTO);
}

