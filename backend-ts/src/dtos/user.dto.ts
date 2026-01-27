import { airlines, users } from '@prisma/client';
import { PassengerUser } from '../types/passenger.types';

export interface UserDTO {
  email: string;
  password: string;
};

export const toUserDTO = (user : users) : UserDTO => ({
    email: user.email,
    password: user.password
});

export interface PassengerDTO {
    id: number,
    name: string,
    surname: string
}

export interface PassengerUserDTO extends PassengerDTO{
    email: string
}

export const toPassengerUserDTO = (passenger : PassengerUser) : PassengerUserDTO => ({
    id: passenger.id,
    name: passenger.name,
    surname: passenger.surname,
    email: passenger.users.email
});

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

export interface CreateAirlineDTO {
    user: UserDTO,
    airline: AirlineDTO
}

export const toCreateAirlineDTO = (user: users, airline: airlines) : CreateAirlineDTO => ({
    user: toUserDTO(user),
    airline: toAirlineDTO(airline)
});