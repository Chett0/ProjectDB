import { passengers } from "../../prisma/generated/prisma";
import prisma from "../config/db";

const getPassengerById = async (
    passengerId : number
) : Promise<passengers | null> => {
    try{
        const passenger : passengers | null = await prisma.passengers.findUnique({
            where: {
                id: passengerId
            }
        })

        return passenger;
    } catch(err){
        throw new Error(
            `Failed to retrieving airline: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    getPassengerById
}