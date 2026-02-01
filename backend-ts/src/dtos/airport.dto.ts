import { airports } from '@prisma/client';

export interface AirportDTO {
    id: number;
    name: string;
    code: string;
    city: string;
    country: string;
}

export const toAirportDTO = (airport: airports): AirportDTO => ({
    id: airport.id,
    name: airport.name,
    code: airport.iata,
    city: airport.city,
    country: airport.country
})

export interface CityDTO {
    name: string;
}

export const toCityDTO = (city: { city: string }): CityDTO => ({
    name: city.city
});