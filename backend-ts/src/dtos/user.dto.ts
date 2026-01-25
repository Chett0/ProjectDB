import { airlines } from '@prisma/client';

export interface UserDTO {
  email: string;
  password: string;
};

export interface PassengerDTO {
    id: number,
    name: string,
    surname: string
}

export interface PassengerUserDTO extends PassengerDTO{
    email: string
}

export interface AdminDTO {
    email: string
}

export interface TokenDTO {
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