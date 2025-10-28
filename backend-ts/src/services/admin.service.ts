import prisma from "../config/db";


const getActivePassengersCount = async () : Promise<number> => {
    try{

        const passengersCount : number = await prisma.passengers.count({
            where: {
                users : {
                    active: true
                }
            }
        });

        return passengersCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving passengers count: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getActiveAirlinesCount = async () : Promise<number> => {
    try{

        const airlinesCount : number = await prisma.airlines.count({
            where: {
                users : {
                    active: true
                }
            }
        });

        return airlinesCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airlines count: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};


const getActiveFlights = async () : Promise<number> => {
    try{

        const airlinesCount : number = await prisma.flights.count({
            where: {
                active: true,
                departure_time: {
                    gt : new Date()
                }
            }
        });

        return airlinesCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airlines count: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

const getActiveRoutes = async () : Promise<number> => {
    try{

        const airlinesCount : number = await prisma.routes.count({});       // check on airlineRoute active 

        return airlinesCount;

    } catch(err){
        throw new Error(
            `Failed to retrieving airlines count: ${err instanceof Error ? err.message : "Unknown error"}`
        ); 
    }
};

export {
    getActivePassengersCount,
    getActiveAirlinesCount,
    getActiveFlights,
    getActiveRoutes
}