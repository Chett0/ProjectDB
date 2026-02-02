import prisma from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {airlines, userrole, users} from '@prisma/client';
import { PayloadJWT, User, UserAirline, UserInfo, UserPassenger } from "../types/auth.types";
import { AdminDTO, AirlineUserDTO, LoginResponseDTO, PassengerDTO, toAdminDTO, toAirlineUserDTO, toPassengerDTO } from "../dtos/user.dto";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors";

const JWT_ACCESS_TOKEN_SECRET : string = process.env.JWT_ACCESS_TOKEN_SECRET! as string;
const JWT_REFRESH_TOKEN_SECRET : string = process.env.JWT_REFRESH_TOKEN_SECRET! as string;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const hashPassword = async (
    password : string
) : Promise<string> => {
    const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    return hashedPassword;
};

export const registerPassenger = async (
    passenger : UserPassenger
) : Promise<PassengerDTO> => {
    
    const existingUser : users | null = await getUserByEmail(passenger.email);
    if(existingUser)
        throw new ConflictError("Email already in use");

    const result : PassengerDTO = await prisma.$transaction(async(tx) => {
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

        return toPassengerDTO(newPassenger);
    });

    return result;
};

export const registerAirline = async (
    airline: UserAirline
) : Promise<AirlineUserDTO> => {

    const existingUser : users | null = await getUserByEmail(airline.email);
        if(existingUser)
            throw new ConflictError("Email already in use");

    const result : AirlineUserDTO = await prisma.$transaction(async(tx) => {

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

        return toAirlineUserDTO(newUser, newAirline);
    });

    return result;
}


export const registerAdmin = async (
    admin: User
) : Promise<AdminDTO> => {
            
    const existingUser : users | null = await getUserByEmail(admin.email);
    if(existingUser)
        throw new ConflictError("Email already in use");

    const user : users = await prisma.users.create({
        data: {
            email: admin.email,
            password: admin.password,
            role: userrole.ADMIN
        }
    });

    return toAdminDTO(user);
}



export const getUserByEmail = async(
    email: string
) : Promise<users | null> => {

    const user : users | null = await prisma.users.findFirst({
        where: {
            email: email,
            active: true
        }
    });

    return user;
};


export const login = async(
    userInfo : UserInfo
) : Promise<LoginResponseDTO> => {

    const user : users | null = await getUserByEmail(userInfo.email);
    if(!user)
        throw new NotFoundError("User not found");

    const isMatch : boolean = await bcrypt.compare(userInfo.password, user.password);
    if(!isMatch)
        throw new UnauthorizedError("Invalid credentials");

    if(user.must_change_password)
        return {
            mustChangePassword: true
        } as LoginResponseDTO;

    const payloadJWT : PayloadJWT = {
        id: user.id,
        role: user.role,
    };

    const accessToken : string = jwt.sign(
        payloadJWT, 
        JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken : string = jwt.sign(
        payloadJWT,
        JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" } 
    );

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        role: user.role,
        mustChangePassword: false
    } 
};


export const refreshToken = async(
    refreshToken: string
) : Promise<any> => {
    try {
        const payload: any = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);

        const payloadJWT : PayloadJWT = {
            id: payload.id,
            role: payload.role
        };

        const accessToken : string = jwt.sign(
            payloadJWT, 
            JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        return {
            accessToken: accessToken,
            role: payload.role
        };
    } catch (err) {
        throw new UnauthorizedError("Invalid refresh token");
    }
};

    

