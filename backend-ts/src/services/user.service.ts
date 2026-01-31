import { users } from "@prisma/client";
import prisma from "../config/db";
import { toUserDTO, UserDTO } from "../dtos/user.dto";

export const updatePassword = async(
    user: users,
    newPassword: string
) : Promise<UserDTO> => {

    const updatedUser : users = await prisma.users.update({
        where: {
            id: user.id
        },
        data: {
            password: newPassword,
            must_change_password: false
        }
    });

    return toUserDTO(updatedUser);
};



export const deleteUserByEmail = async (
    email: string
): Promise<UserDTO | null> => {
    try {
        const user: users | null = await prisma.users.update({
            where: { email },
            data: { active: false }
        });

        return user ? toUserDTO(user) : null;
    } catch (err) {
        return null;
    }
};

export const reactivateUserByEmail = async (
    email: string
): Promise<UserDTO | null> => {
    try {
        const user: users | null = await prisma.users.update({
            where: { email },
            data: { active: true }
        });

        return user ? toUserDTO(user) : null;
    } catch (err) {
        return null;
    }
};