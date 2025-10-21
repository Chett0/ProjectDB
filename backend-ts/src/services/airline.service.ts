import { airlines } from "../../prisma/generated/prisma";
import prisma from "../config/db";

const getAirlineById = async (
    id : number
) : Promise<airlines | null> => {
    try{
        const airline : airlines | null = await prisma.airlines.findUnique({
            where: {
                id: id
            }
        })

        return airline;
    } catch(err){
        throw new Error(
            `Failed to create passenger: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    getAirlineById
}