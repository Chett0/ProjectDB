import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as authHelper from "../utils/helpers/auth.helpers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserAirline, UserPassenger, UserRole } from "../types/auth.types";
import { users } from "../../prisma/generated/prisma";


const JWT_ACCESS_TOKEN_SECRET : string = process.env.JWT_ACCESS_TOKEN_SECRET! as string;
const JWT_REFRESH_TOKEN_SECRET : string = process.env.JWT_REFRESH_TOKEN_SECRET! as string;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const registerAirline = async(req : Request, res : Response): Promise<void> => {
    try{
        const { email, name, code } = req.body;
        
        if(!email || !name || !code){
            res.status(400).json({
                message: "Missing required fields",
                success: false
            });
            return;
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            res.status(409).json({
                message: "Email already in use",
                success: false
            });
            return;
        }

        const password : string = await authHelper.generateRandomPassword();

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userAirline : UserAirline = {
            email: email,
            password: hashedPassword,
            name: name,
            code: code,
            role: UserRole.AIRLINE
        }

        const {newUser, newAirline} = await authService.registerAirline(userAirline);

        res.status(201).json({
            message: "Passenger created successfully",
            email: newUser.email,
            password: password,
            newAirline: newAirline,
            success: true
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error while creating airline",
            success: false
        })
    }
};




const registerPassenger = async(req : Request, res : Response) : Promise<void> => {
    try{
        const { email, name, surname, password } = req.body;
        
        if(!email || !name || !surname || !password){
            res.status(400).json({
                message: "Missing required fields",
                success: false
            });
            return;
        }

        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            res.status(409).json({
                message: "Email already in use",
                success: false
            });
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

        const {newUser, newPassenger} = await authService.registerPassenger(userPassenger);

        res.status(201).json({
            message: "Passenger created successfully",
            email: newUser.email,
            newPassenger: newPassenger,
            success: true
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error while creating passenger",
            success: false
        })
    }
};


const registerAdmin = async(req : Request, res : Response) : Promise<void> => {
    try{
        const { email, password } = req.body;
        
        if(!email || !password){
            res.status(400).json({
                message: "Missing required fields",
                success: false
            });
            return;
        }
        
        const existingUser : users | null = await authService.getUserByEmail(email);

        if(existingUser){
            res.status(409).json({
                message: "Email already in use",
                success: false
            });
            return;
        }

        const hashedPassword : string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const userPassenger : User = {
            email: email,
            password: hashedPassword,
            role: UserRole.ADMIN
        }

        const newUser = await authService.registerAdmin(userPassenger);

        res.status(201).json({
            message: "Passenger created successfully",
            email: newUser.email,
            success: true
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error while creating airline",
            success: false
        })
    }
};


const login = async(req : Request, res : Response) : Promise<void> => {
    try {
        const {email, password} = req.body;

        const user : users | null = await authService.getUserByEmail(email);

        if(!user || !user.active){
            res.status(404).json({
                message: "User not exists",
                success: false
            });
            return;
        }

        const isMatch : boolean = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.status(409).json({ 
                message: "Wrong credentials",
                success: false
            });
            return;
        }

        if(user.must_change_password){
            res.status(303).json({
                message:"Password has to be changed",
                role:user.role.valueOf(),
                success: true
            })
            return;
        }

        const payloadJWT = {
            id: user.id,
            role: user.role,
            email: user.email,
        };

        const accessToken = jwt.sign(
            payloadJWT, 
            JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            payloadJWT,
            JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" } 
        );

        res.status(201).json({
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            role: user.role
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error while login",
            success: false
        })
    }
};

// const refresh = async(req : Request, res : Response) : Promise<void> => {
//     try {
        

//         res.status(201).json({
//             message: "Login successful",
//             accessToken: accessToken,
//             refreshToken: refreshToken,
//             role: user.role
//         })

//     } catch (error) {
//         res.status(500).json({
//             message: "Internal server error while login",
//             success: false
//         })
//     }
// };


const updatePassword = async(req : Request, res : Response) : Promise<void> => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if(!email || !oldPassword || !newPassword){
            res.status(400).json({
                message: "Missing required fields",
                success: false
            });
            return;
        }

        const user : users | null = await authService.getUserByEmail(email);

        if(!user){
            res.status(404).json({
                message: "User not exists",
                success: false
            });
            return;
        }

        const isMatch : boolean = await bcrypt.compare(oldPassword, user.password);

        if(!isMatch){
            res.status(409).json({
                message: "Wrong password",
                success: false
            });
            return;
        }

        const hashedPassword : string = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        console.log(hashedPassword)

        await authService.updatePassword(user, hashedPassword);

        res.status(200).json({
            message: "Password updated successfully",
            success: true
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error while updating password",
            success: false
        })
    }
};

export {
    registerPassenger,
    registerAirline,
    registerAdmin,
    login,
    updatePassword
}