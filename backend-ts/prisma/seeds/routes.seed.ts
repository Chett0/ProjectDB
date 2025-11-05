import prisma from "./seed";
import { airlines, airports, routes } from '@prisma/client';

export async function seedRoutes() {

    console.log(`🗺️ Seeding routes...`);
  
    const airports : airports[] = await prisma.airports.findMany();

    const routes : routes[] = [];

    const routesList = [
        ["VCE", "AMS"], ["AMS", "VCE"],
        ["VCE", "JFK"], ["JFK", "VCE"],
        ["AMS", "JFK"], ["JFK", "AMS"],
        ["VCE", "CDG"], ["CDG", "VCE"],
        ["AMS", "CDG"], ["CDG", "AMS"],
        ["CDG", "JFK"], ["JFK", "CDG"],
        ["JFK", "LAX"], ["LAX", "JFK"],
        ["CDG", "LAX"], ["LAX", "CDG"],
        ["AMS", "LHR"], ["LHR", "AMS"],
        ["VCE", "LHR"], ["LHR", "VCE"],
        ["LHR", "JFK"], ["JFK", "LHR"],
        ["LHR", "LAX"], ["LAX", "LHR"],
        ["CDG", "LHR"], ["LHR", "CDG"]
    ];

    for(const route of routesList) {
        
        let depAirport : airports | null = await prisma.airports.findFirst({
            where : {
                iata : route[0]!
            }
        })

        let arrAirport : airports | null = await prisma.airports.findFirst({
            where : {
                iata : route[1]!
            }
        })

        if(depAirport && arrAirport){
            routes.push(await prisma.routes.upsert({
                where : {
                        departure_airport_id_arrival_airport_id : {
                            departure_airport_id : depAirport.id,
                            arrival_airport_id :  arrAirport.id
                        }
                    },
                    update : {},
                    create : {
                        departure_airport_id : depAirport.id,
                        arrival_airport_id : arrAirport.id
                    }
            }))
        }
        
    }

    const airlines : airlines[] = await prisma.airlines.findMany();

    for(const airline of airlines){
        for(const route of routes){
            await prisma.airlineRoute.upsert({
                where : {
                    airline_id_route_id : {
                        airline_id : airline.id,
                        route_id : route.id
                    }
                },
                update : {},
                create : {
                    airline_id : airline.id,
                    route_id : route.id
                }
            })
        }
    }

  console.log(`✅ Routes seeded!`);

}