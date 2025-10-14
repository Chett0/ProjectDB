import prisma from "../config/db";
import { airlines, passengers, userrole, users } from '../../prisma/generated/prisma';
import { CreateAirlineResult, CreatePassengerResult, User, UserAirline, UserPassenger } from "../types/auth.types";

const registerPassenger = async (
    passenger : UserPassenger
) : Promise<CreatePassengerResult> => {
    try{
        const result : CreatePassengerResult = await prisma.$transaction(async(tx) => {
            const newUser = await tx.users.create({
                data: {
                    email: passenger.email,
                    password: passenger.password,
                    role: userrole.PASSENGER,
                }
            });

            const newPassenger = await tx.passengers.create({
                data: {
                    name: passenger.name,
                    surname: passenger.surname,
                    id: newUser.id
                }
            });

            if(!newUser || !newPassenger)
                throw new Error;

            return {
                newUser: newUser,
                newPassenger: newPassenger
            };
        });

        return result;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const registerAirline = async (
    airline: UserAirline
) : Promise<CreateAirlineResult> => {
    try{
        const result : CreateAirlineResult = await prisma.$transaction(async(tx) => {
            const newUser : users = await tx.users.create({
                data: {
                    email: airline.email,
                    password: airline.password,
                    role: userrole.AIRLINE,
                    must_change_password: true
                }
            });

            const newAirline : airlines = await tx.airlines.create({
                data: {
                    name: airline.name,
                    code: airline.code,
                    id: newUser.id
                }
            });

            if(!newUser || !newAirline)
                throw new Error;

            return {
                newUser: newUser,
                newAirline: newAirline
            };
        });

        return result;
    } catch(err){
        throw new Error(
            `Failed to create airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}


const registerAdmin = async (
    admin: User
) : Promise<users> => {
    try{
        const user : users = await prisma.users.create({
            data: {
                email: admin.email,
                password: admin.password,
                role: userrole.ADMIN
            }
        });
        return user;
    } catch(err){
        throw new Error(
            `Failed to create airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}



const getUserByEmail = async(
    email: string
) : Promise<users | null> => {
    try{
        const user : users | null = await prisma.users.findFirst({
            where: {email}
        });
        return user;
    } catch(err){
        throw new Error(
            `Failed to check email already in use: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
}

export {
    registerPassenger,
    registerAirline,
    registerAdmin,
    getUserByEmail
}