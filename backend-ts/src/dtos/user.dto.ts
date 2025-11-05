import { airlines } from '@prisma/client';

interface UserDTO {
  email: string;
  password: string;
};


interface PassengerDTO {
    id: number,
    name: string,
    surname: string
}

interface PassengerUserDTO extends PassengerDTO{
    email: string
}

interface AdminDTO {
    email: string
}

interface TokenDTO {
    accessToken: string,
    role: string
}

interface AirlineDTO {
    id: number, 
    name: string,
    code: string,
}

class AirlineDTO {
    id: number;
    name: string;
    code: string;

    constructor(id: number, name: string, code: string) {
        this.id = id;
        this.name = name;
        this.code = code;
    }

    static fromPrisma(airline: airlines): AirlineDTO {
        return new AirlineDTO(
            airline.id,
            airline.name,
            airline.code
        );
    }

    static fromPrismaList(list: airlines[]): AirlineDTO[] {
        return list.map(AirlineDTO.fromPrisma);
    }
}


export type {
    UserDTO,
    PassengerDTO,
    AdminDTO,
    TokenDTO,
    PassengerUserDTO
}

export {
    AirlineDTO
}