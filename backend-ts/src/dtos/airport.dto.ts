import { airports } from "../../prisma/generated/prisma"

interface AirportDTO {
    id: number
    name: string,
    code: string,
    city: string,
    country: string
}

export type {
    AirportDTO
}



function toAirportDTO(airport : airports) : AirportDTO {
    try{
        const airportDTO : AirportDTO = {
            id: airport.id,
            name: airport.name,
            code: airport.code,
            city: airport.city,
            country: airport.country
        };
        return airportDTO;
    } catch(err){
        console.error("Error while getting airportDTO")
        throw err;
    }
}


export {
    toAirportDTO
}