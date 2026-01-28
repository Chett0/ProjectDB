import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { User, UserAirline, UserPassenger, UserRole } from "../types/auth.types";
import { successResponse } from "../utils/helpers/response.helper";
import { AdminDTO, AirlineUserDTO, LoginResponseDTO, PassengerDTO } from "../dtos/user.dto";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { UserInfo } from "../types/auth.types";

const cookieparser = require('cookie-parser');

export const registerAirline = asyncHandler(
    async(req : Request, res : Response): Promise<Response> => {
    
        const { email, name, code } = req.body;
        
        if(!email || !name || !code)
            throw new BadRequestError("Missing required fields");

        // const password : string = await authHelper.generateRandomPassword();
        const password : string = "123";
        const hashedPassword : string = await authService.hashPassword(password);

        const userAirline : UserAirline = {
            email: email,
            password: hashedPassword,
            name: name,
            code: code,
            role: UserRole.AIRLINE
        }

        const airline : AirlineUserDTO = await authService.registerAirline(userAirline);

        return successResponse<AirlineUserDTO>(
            res, 
            "Airline created successfully", 
            airline, 
            201
        );
    }
);

export const registerPassenger = asyncHandler( 
    async(req : Request, res : Response) : Promise<Response> => {

        const { email, name, surname, password } = req.body;

        if(!email || !name || !surname || !password)
            throw new BadRequestError("Missing required fields");

        const hashedPassword : string = await authService.hashPassword(password);

        const userPassenger : UserPassenger = {
            email: email,
            password: hashedPassword,
            name: name,
            surname: surname,
            role: UserRole.PASSENGER
        }

        const newPassenger : PassengerDTO = await authService.registerPassenger(userPassenger);

        return successResponse<PassengerDTO>(
            res, 
            "Passenger created successfully", 
            newPassenger, 
            201
        );
    }
);


export const registerAdmin = asyncHandler(
    async(req : Request, res : Response) : Promise<Response> => {

        const { email, password } = req.body;
        if(!email || !password)
            throw new BadRequestError("Missing required fields");

        const hashedPassword : string = await authService.hashPassword(password);

        const userPassenger : User = {
            email: email,
            password: hashedPassword,
            role: UserRole.ADMIN
        }

        const admin : AdminDTO = await authService.registerAdmin(userPassenger);

        return successResponse<AdminDTO>(
            res, 
            "Admin created successfully", 
            admin, 
            201
        );
    }
);


export const login = asyncHandler(
    async(req : Request, res : Response) : Promise<Response> => {

        const {email, password} = req.body;

        if(!email || !password)
            throw new BadRequestError("Missing required fields");

        const user : UserInfo = {
            email: email,
            password: password,
        }

        const loginResponse : LoginResponseDTO =await authService.login(user);

        if(loginResponse.mustChangePassword){
            return successResponse<null>(
                res, 
                "Password need to be changed", 
                null, 
                303
            );
        }

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'none', 
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000 * 1
        });

        return successResponse<LoginResponseDTO>(
            res, 
            "Login successful", 
            loginResponse, 
            201
        );
    }
);

//to do
export const refreshToken = asyncHandler( 
    async(req : Request, res : Response) : Promise<any> => {

        if (!req.cookies?.jwt) 
            throw new UnauthorizedError("Refresh token not found");

        const refreshToken : string = req.cookies.jwt;

        const refreshResponse = await authService.refreshToken(refreshToken);

        return successResponse<any>(
            res, 
            "Token refreshed successful", 
            refreshResponse
        );
    }
);
