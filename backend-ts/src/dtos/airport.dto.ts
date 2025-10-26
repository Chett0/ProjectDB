import { airports } from "../../prisma/generated/prisma"

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
            airport.code,
            airport.city,
            airport.country
        );
    }

    static fromPrismaList(list: airports[]): AirportDTO[] {
        return list.map(AirportDTO.fromPrisma);
    }
}

export {
    AirportDTO
}