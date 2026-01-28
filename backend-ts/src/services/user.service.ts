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


export const deleteUser = async (
    userId: number
): Promise<UserDTO | null> => {

        const user : users | null = await prisma.users.update({ 
            where: { 
                id: userId 
            },
            data: {
                active: false
            }
        });
        
        return user ? toUserDTO(user) : null;
};