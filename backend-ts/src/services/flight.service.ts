import { flights } from "../../prisma/generated/prisma";
import prisma from "../config/db";


const getFlightbyId = async (
    flightId: number
) : Promise<flights | null> => {
    try{
        
        const flight : flights | null = await prisma.flights.findUnique({
            where : {
                id: flightId,
                active: true
            }
        });

        return flight;


    } catch(err){
        throw new Error(
            `Failed to creating aircraft classes: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    getFlightbyId
}