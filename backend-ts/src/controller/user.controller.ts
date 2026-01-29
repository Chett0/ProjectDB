import { Request, Response } from "express";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { users } from "@prisma/client";
import bcrypt from "bcrypt";
import { successResponse } from "../utils/helpers/response.helper";
import { UserDTO } from "../dtos/user.dto";

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const updatePassword = asyncHandler(
    async(req : Request, res : Response) : Promise<Response> => {

        const { email, oldPassword, newPassword } = req.body;

        if(!email || !oldPassword || !newPassword)
            throw new BadRequestError("Missing required fields");

        const user : users | null = await authService.getUserByEmail(email);
        if(!user)
            throw new NotFoundError("User not found");

        const isMatch : boolean = await bcrypt.compare(oldPassword, user.password);
        if(!isMatch)
            throw new UnauthorizedError("Old password is incorrect");

        const hashedPassword : string = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        const updatedUser : UserDTO = await userService.updatePassword(user, hashedPassword);

        return successResponse<UserDTO>(
            res, 
            "Password updated successfully",
            updatedUser
        );
    }
);

export const deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {

        const userIdParam = req.params.userId;
        if (!userIdParam) 
            throw new BadRequestError("Missing userId parameter");

        const userId = parseInt(userIdParam);
        if (isNaN(userId)) 
            throw new BadRequestError("Invalid userId parameter");

        const user : UserDTO | null = await userService.deleteUser(userId);
        if(!user)
            throw new NotFoundError("User not found");

        return successResponse<UserDTO>(
            res, 
            "User deleted successfully",
            user
        );
    }
);