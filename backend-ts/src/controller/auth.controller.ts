import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CreatePassengerResult, PayloadJWT, User, UserAirline, UserPassenger, UserRole } from "../types/auth.types";
import { users } from "../../prisma/generated/prisma";
import { errorResponse, missingFieldsResponse, notFoundResponse, successResponse } from "../utils/helpers/response.helper";
import { AdminDTO, PassengerDTO, PassengerUserDTO, TokenDTO, UserDTO } from "../dtos/user.dto";

const cookieparser = require('cookie-parser');


const JWT_ACCESS_TOKEN_SECRET : string = process.env.JWT_ACCESS_TOKEN_SECRET! as string;
const JWT_REFRESH_TOKEN_SECRET : string = process.env.JWT_REFRESH_TOKEN_SECRET! as string;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const registerAirline = async(req : Request, res : Response): Promise<Response> => {
    try{
        const { email, name, code } = req.body;
        
        if(!email || !name || !code){
            return missingFieldsResponse(res);
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            return errorResponse(res, "Email already in use", null, 409);
        }

        // const password : string = await authHelper.generateRandomPassword();
        const password : string = "123";

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userAirline : UserAirline = {
            email: email,
            password: hashedPassword,
            name: name,
            code: code,
            role: UserRole.AIRLINE
        }

        await authService.registerAirline(userAirline);

        const user : UserDTO = {
            email: email,
            password: password
        }

        return successResponse(res, "Airline created successfully", user, 201);
    }
    catch (error) {
        console.error("Error while creating airline: ", error);
        return errorResponse(res, "Internal server error while creating airline");
    }
};




const registerPassenger = async(req : Request, res : Response) : Promise<Response> => {
    try{
        const { email, name, surname, password } = req.body;
        
        if(!email || !name || !surname || !password){
            return missingFieldsResponse(res);
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            return errorResponse(res, "Email already in use", null, 409);
        }

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userPassenger : UserPassenger = {
            email: email,
            password: hashedPassword,
            name: name,
            surname: surname,
            role: UserRole.PASSENGER
        }

        const newUser : CreatePassengerResult = await authService.registerPassenger(userPassenger);

        const passenger : PassengerUserDTO = {
            id: newUser.newPassenger.id,
            email: email,
            name: name,
            surname: surname
        }


        return successResponse(res, "Passenger created successfully", passenger, 201);
    }
    catch (error) {
        console.error("Error while creating passenger: ", error);
        return errorResponse(res,  "Internal server error while creating passenger");
    }
};


const registerAdmin = async(req : Request, res : Response) : Promise<Response> => {
    try{
        const { email, password } = req.body;
        
        if(!email || !password){
            return missingFieldsResponse(res);
        }
        
        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            return errorResponse(res, "Email already in use", null, 409);
        }

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userPassenger : User = {
            email: email,
            password: hashedPassword,
            role: UserRole.ADMIN
        }

        await authService.registerAdmin(userPassenger);

        const admin : AdminDTO = {
            email: email
        }

        return successResponse(res, "Admin created successfully", admin, 201);
    }
    catch (error) {
        console.error("Error while creating admin: ", error);
        return errorResponse(res, "Internal server error while creating admin");
    }
};


const login = async(req : Request, res : Response) : Promise<Response> => {
    try {
        const {email, password} = req.body;

        const user : users | null = await authService.getUserByEmail(email);

        if(!user || !user.active){
            return errorResponse(res, "User not exists", 404);
        }

        const isMatch : boolean = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return errorResponse(res, "Wrong credentials", 409);
        }

        if(user.must_change_password){
            return successResponse(res, "Password need to be changed", null, 303);

            // res.status(303).json({
            //     message:"Password has to be changed",
            //     role:user.role.valueOf(),
            //     success: true
            // })
        }

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

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'none', 
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000 * 1
        });

        const loginResponse : TokenDTO = {
            accessToken: accessToken,
            role: user.role
        }

        return successResponse(res, "Login successful", loginResponse, 201);
        // res.status(201).json({
        //     message: "Login successful",
        //     accessToken: accessToken,
        //     // refreshToken: refreshToken,
        //     role: user.role
        // })

    } catch (error) {
        console.error("Error while login: ", error);
        return errorResponse(res, "Internal server error while login");
    }
};

const refreshToken = async(req : Request, res : Response) : Promise<Response> => {
    try{
        if (req.cookies?.jwt) {

            const refreshToken : string = req.cookies.jwt;
            let refreshResponse : TokenDTO | null = null;

            jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, (err: any, payload: any) => {
                if (err) {
                    return errorResponse(res, "Refresh token not valid", null, 401);
                }
                else {

                    const payloadJWT : PayloadJWT = {
                        id: payload.id,
                        role: payload.role
                    };

                    const accessToken : string = jwt.sign(
                        payloadJWT, 
                        JWT_ACCESS_TOKEN_SECRET,
                        { expiresIn: "15m" }
                    );

                    refreshResponse = {
                        accessToken: accessToken,
                        role: payload.role
                    }
                }
            });

            if(refreshResponse)
                return successResponse(res, "Token refreshed successful", refreshResponse);
            else    
                throw new Error();
        }
        else{
            return notFoundResponse(res, "Refresh token not found");
        }

    } catch (error) {
        console.error("Error while refreshing token: ", error)
        return errorResponse(res, "Internal server error while refreshing token");
    }
};


const updatePassword = async(req : Request, res : Response) : Promise<Response> => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if(!email || !oldPassword || !newPassword){
            return missingFieldsResponse(res);
        }

        const user : users | null = await authService.getUserByEmail(email);

        if(!user){
            return notFoundResponse(res, "User not found");
        }

        const isMatch : boolean = await bcrypt.compare(oldPassword, user.password);

        if(!isMatch){
            return errorResponse(res, "Wrong old password", null, 409);
        }

        const hashedPassword : string = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        await authService.updatePassword(user, hashedPassword);

        return successResponse(res, "Password updated successfully");

    } catch (error) {
        console.error("Error while updating password: ", error);
        return errorResponse(res, "Internal server error while updating password");
    }
};

export {
    registerPassenger,
    registerAirline,
    registerAdmin,
    login,
    refreshToken,
    updatePassword
}