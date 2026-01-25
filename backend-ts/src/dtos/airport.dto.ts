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



class CitiesDTO {
    cities: string[];

    constructor(cities: string[]) {
        this.cities = cities;
    }
}

export {
    CitiesDTO
}