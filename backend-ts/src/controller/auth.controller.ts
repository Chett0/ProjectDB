import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as authHelper from "../utils/helpers/auth.helpers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PayloadJWT, User, UserAirline, UserPassenger, UserRole } from "../types/auth.types";
import { users } from "../../prisma/generated/prisma";
import { sendResponse, sendMissingFieldsResponse } from "../utils/helpers/response.helper";
import { AdminDTO, PassengerDTO, TokenDTO, UserDTO } from "../dtos/user.dto";

const cookieparser = require('cookie-parser');


const JWT_ACCESS_TOKEN_SECRET : string = process.env.JWT_ACCESS_TOKEN_SECRET! as string;
const JWT_REFRESH_TOKEN_SECRET : string = process.env.JWT_REFRESH_TOKEN_SECRET! as string;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const registerAirline = async(req : Request, res : Response): Promise<void> => {
    try{
        const { email, name, code } = req.body;
        
        if(!email || !name || !code){
            sendMissingFieldsResponse(res);
            return;
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            sendResponse(res, false, 409, "Email already in use");
            return;
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

        sendResponse(res, true, 201, "Airline created successfully", user);
    }
    catch (error) {
        console.error("Error while creating airline: ", error);
        sendResponse(res, false, 500, "Internal server error while creating airline");
    }
};




const registerPassenger = async(req : Request, res : Response) : Promise<void> => {
    try{
        const { email, name, surname, password } = req.body;
        
        if(!email || !name || !surname || !password){
            sendMissingFieldsResponse(res);
            return;
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            sendResponse(res, false, 409, "Email already in use");
            return;
        }

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userPassenger : UserPassenger = {
            email: email,
            password: hashedPassword,
            name: name,
            surname: surname,
            role: UserRole.PASSENGER
        }

        await authService.registerPassenger(userPassenger);

        const passenger : PassengerDTO = {
            email: email,
            name: name,
            surname: surname
        }


        sendResponse(res, true, 201, "Passenger created successfully", passenger);
    }
    catch (error) {
        console.error("Error while creating passenger: ", error);
        sendResponse(res, false, 500, "Internal server error while creating passenger");
    }
};


const registerAdmin = async(req : Request, res : Response) : Promise<void> => {
    try{
        const { email, password } = req.body;
        
        if(!email || !password){
            sendMissingFieldsResponse(res);
            return;
        }
        
        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            sendResponse(res, false, 409, "Email already in use");
            return;
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

        sendResponse(res, true, 201, "Admin created successfully", admin);
    }
    catch (error) {
        console.error("Error while creating admin: ", error);
        sendResponse(res, false, 500, "Internal server error while creating admin");
    }
};


const login = async(req : Request, res : Response) : Promise<void> => {
    try {
        const {email, password} = req.body;

        const user : users | null = await authService.getUserByEmail(email);

        if(!user || !user.active){
            sendResponse(res, false, 404, "User not exists");
            return;
        }

        const isMatch : boolean = await bcrypt.compare(password, user.password);

        if(!isMatch){
            sendResponse(res, false, 409, "Wrong credentials");
            return;
        }

        if(user.must_change_password){
            sendResponse(res, true, 303, "Password need to be changed");

            // res.status(303).json({
            //     message:"Password has to be changed",
            //     role:user.role.valueOf(),
            //     success: true
            // })
            return;
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

        sendResponse(res, true, 201, "Login successful", loginResponse);
        // res.status(201).json({
        //     message: "Login successful",
        //     accessToken: accessToken,
        //     // refreshToken: refreshToken,
        //     role: user.role
        // })

    } catch (error) {
        console.error("Error while login: ", error)
        sendResponse(res, false, 500, "Internal server error while login");
    }
};

const refreshToken = async(req : Request, res : Response) : Promise<void> => {
    try{
        if (req.cookies?.jwt) {

            const refreshToken : string = req.cookies.jwt;

            jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, (err: any, payload: any) => {
                if (err) {
                    sendResponse(res, false, 401, "Refresh token not valid");
                    return;
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

                    const refreshResponse : TokenDTO = {
                        accessToken: accessToken,
                        role: payload.role
                    }

                    sendResponse(res, true, 201, "Token refreshed successful", refreshResponse);
                }
            });
        }
        else{
            sendResponse(res, false, 401, "Missing refresh token");
        }

    } catch (error) {
        console.error("Error while refreshing token: ", error)
        sendResponse(res, false, 401, "Internal server error while refreshing token");
    }
};


const updatePassword = async(req : Request, res : Response) : Promise<void> => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if(!email || !oldPassword || !newPassword){
            sendMissingFieldsResponse(res);
            return
        }

        const user : users | null = await authService.getUserByEmail(email);

        if(!user){
            sendResponse(res, false, 404, "User not exists");
            return;
        }

        const isMatch : boolean = await bcrypt.compare(oldPassword, user.password);

        if(!isMatch){
            sendResponse(res, false, 409, "Wrong old password");
            return;
        }

        const hashedPassword : string = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        await authService.updatePassword(user, hashedPassword);

        sendResponse(res, true, 200, "Password updated successfully");

    } catch (error) {
        console.error("Error while updating password: ", error);
        sendResponse(res, false, 500, "Internal server error while updating password");
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