import { airports } from '@prisma/client';

class AirportDTO {
    id: number;
    name: string;
    code: string;
    city: string;
    country: string;

    constructor(id: number, name: string, code: string, city: string, country: string) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.city = city;
        this.country = country;
    }

    static fromPrisma(airport: airports): AirportDTO {
        return new AirportDTO(
            airport.id,
            airport.name,
            airport.iata,
            airport.city,
            airport.country
        );
    }

    static fromPrismaList(list: airports[]): AirportDTO[] {
        return list.map(AirportDTO.fromPrisma);
    }
}


class CitiesDTO {
    cities: string[];

    constructor(cities: string[]) {
        this.cities = cities;
    }
}

export {
    AirportDTO,
    CitiesDTO
}