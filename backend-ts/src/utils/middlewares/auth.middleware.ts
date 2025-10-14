const jwt = require("jsonwebtoken");
import { NextFunction, Response } from "express";
import { AuthenticatedRequest, UserRole } from "../../types/auth.types";

const verifyToken = async (req : AuthenticatedRequest, res : Response, next : NextFunction) => {
    try {
        const authHeader : string | undefined = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                message: "Missing Header",
                success: false,
            });
        }

        const accessToken : string | undefined = authHeader.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({ 
                message: "Missing Token",
                success: false,
            });
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err: any, payload: any) => {
            if (err){ 
                return res.sendStatus(403).json({
                    message: "Invalid token",
                    success: false
                });
            }

            req.user = {
                id: payload._id,
                role : payload.role
            }
            
            next();
        });
    } catch (err) {
        return res.status(500).json({ 
            message: "Internal server error on auth.middleware",
            success: false
        });
    }
}

const verifyRole = (...allowedRoles : string[]) => {
    return (req : AuthenticatedRequest, res : Response, next : NextFunction) => {
        if(!req.user){
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "Access denied",
                success: false
            });
        }

        next();
    }
}

export {
    verifyToken,
    verifyRole
}


