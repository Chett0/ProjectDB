import { airlines, passengers, users } from '@prisma/client';
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

export const toPassengerDTO = (passenger : passengers) : PassengerDTO => ({
    id: passenger.id,
    name: passenger.name,
    surname: passenger.surname
});

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

export const toAdminDTO = (user : users) : AdminDTO => ({
    email: user.email
});

export interface LoginResponseDTO {
    accessToken: string,
    refreshToken: string,
    role: string,
    mustChangePassword: boolean
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

export interface AirlineUserDTO {
    user: UserDTO,
    airline: AirlineDTO
}

export const toAirlineUserDTO = (user: users, airline: airlines) : AirlineUserDTO => ({
    user: toUserDTO(user),
    airline: toAirlineDTO(airline)
});