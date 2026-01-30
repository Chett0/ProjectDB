import prisma from "./seed";
import { airlines, airports, routes } from '@prisma/client';

export async function seedRoutes() {

    console.log(`🗺️ Seeding routes...`);
  
    const airports : airports[] = await prisma.airports.findMany();

    const routesList = [
        ["VCE", "AMS"], ["AMS", "VCE"],
        ["VCE", "JFK"], ["JFK", "VCE"],
        ["AMS", "JFK"], ["JFK", "AMS"],
        ["VCE", "CDG"], ["CDG", "VCE"],
        ["AMS", "CDG"], ["CDG", "AMS"],
        ["CDG", "JFK"], ["JFK", "CDG"],
        ["JFK", "LAX"], ["LAX", "JFK"],
        // ["CDG", "LAX"], ["LAX", "CDG"],
        // ["AMS", "LHR"], ["LHR", "AMS"],
        // ["VCE", "LHR"], ["LHR", "VCE"],
        // ["LHR", "JFK"], ["JFK", "LHR"],
        // ["LHR", "LAX"], ["LAX", "LHR"],
        // ["CDG", "LHR"], ["LHR", "CDG"]
    ];

    const airportMap = new Map(airports.map(a => [a.iata, a.id]));

    const routeRows = routesList
    .map(([dep, arr]) => {
      const depId = airportMap.get(dep!);
      const arrId = airportMap.get(arr!);
      if (!depId || !arrId) return null;

      return {
        departure_airport_id: depId,
        arrival_airport_id: arrId,
      };
    }) as { departure_airport_id: number; arrival_airport_id: number }[];

    await prisma.routes.createMany({
        data: routeRows,
        skipDuplicates: true,
    });

    const routes : routes[] = await prisma.routes.findMany();
    const airlines : airlines[] = await prisma.airlines.findMany();

    const airlineRouteRows = airlines.flatMap(airline =>
        routes.map(route => ({
            airline_id: airline.id,
            route_id: route.id,
        }))
    );

    await prisma.airlineRoute.createMany({
        data: airlineRouteRows,
        skipDuplicates: true,
    });

  console.log(`✅ Routes seeded!`);

}