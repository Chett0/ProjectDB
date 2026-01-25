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

export interface AirlineDTO {
    id: number, 
    name: string,
    code: string,
}

export const toAirlineDTO = (airline : airlines) : AirlineDTO => ({
    id: airline.id,
    name: airline.name,
    code: airline.code
});

export type {
    UserDTO,
    PassengerDTO,
    AdminDTO,
    TokenDTO,
    PassengerUserDTO
}