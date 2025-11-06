import { aircraft_classes, aircrafts, airlineRoute, airports, bookingstate, flights, passengers, routes, seats, seatstate } from "@prisma/client";
import prisma from "./seed";
import {
  addMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  subDays,
  setHours,
  setMinutes,
} from "date-fns";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateFlightPrice(distance: number): number {
  // Base fare covers taxes, fees, etc.
  const baseFare = 50;

  // Tiered per-km rates (simulating price efficiency on long flights)
  let ratePerKm;
  if (distance < 500) ratePerKm = 0.25; // short haul
  else if (distance < 1500) ratePerKm = 0.18; // medium haul
  else if (distance < 4000) ratePerKm = 0.12; // long haul
  else ratePerKm = 0.08; // ultra long haul

  const price = baseFare + distance * ratePerKm;

  // Add some realistic random variation (simulating airline differences)
  const variation = 0.9 + Math.random() * 0.2; // ±10%
  return Math.round(price * variation);
}

export async function seedFlights() {
  console.log("✈️ Seeding flights, seats, tickets...");

  const airlineRoutes: airlineRoute[] = await prisma.airlineRoute.findMany();
  const passenger : passengers | null = await prisma.passengers.findFirst();

  if(!passenger)
        return;

  for (const airlineRoute of airlineRoutes) {
    const route: routes | null = await prisma.routes.findUnique({
      where: { id: airlineRoute.route_id },
    });
    if (!route) continue;

    const depAirport: airports | null = await prisma.airports.findUnique({
      where: { id: route.departure_airport_id },
    });
    const arrAirport: airports | null = await prisma.airports.findUnique({
      where: { id: route.arrival_airport_id },
    });

    if (!depAirport || !arrAirport) continue;

    console.log(`Seeding flights for route: ${depAirport.iata}-${arrAirport.iata}`)

    const flightPrice: number = estimateFlightPrice(
      haversineDistance(
        Number(depAirport.lat),
        Number(depAirport.lon),
        Number(arrAirport.lat),
        Number(arrAirport.lon)
      )
    );

    for (let m = -3; m < 3; m++) {
      const monthStart = startOfMonth(addMonths(new Date(), m));
    //   const monthEnd = endOfMonth(monthStart);

      // Ottieni tutti i giorni del mese
    //   const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    //   for (const day of days) {
        // Orari di partenza giornalieri
        const departureTimes = [9, 15, 21];
        const aircrafts : aircrafts[] = await prisma.aircrafts.findMany({take : 3});

        const aircraftClasses : aircraft_classes[][] = [];

        for(const aircraft of aircrafts){
            aircraftClasses.push(await prisma.aircraft_classes.findMany({where : {aircraft_id : aircraft.id}}))
        }

        for (let i = 0; i < departureTimes.length; i++) {
          const departureTime = setMinutes(setHours(monthStart, departureTimes[i]!), 0);

          // Durata stimata in ore basata sulla distanza (es. 800 km/h)
          const distanceKm = haversineDistance(
            Number(depAirport.lat),
            Number(depAirport.lon),
            Number(arrAirport.lat),
            Number(arrAirport.lon)
          );
          const flightDurationHours = distanceKm / 800;
          const arrivalTime = new Date(
            departureTime.getTime() + flightDurationHours * 60 * 60 * 1000
          );

          const flight : flights | null = await prisma.flights.create({
            data: {
              aircraft_id: aircrafts[i]!.id,
              route_id: route.id,
              departure_time: departureTime,
              arrival_time: arrivalTime,
              base_price: flightPrice,
              nSeats_available: aircrafts[i]!.nSeats,
              nSeats_total : aircrafts[i]!.nSeats,
              duration_seconds: Math.floor((arrivalTime.getTime() - departureTime.getTime()) / 1000)
            },
          });

          if(!flight)
            continue;


          let letter : string = 'A';
                      let rowNumber : number = 1;
          
                      for(const cls of aircraftClasses[i]!){
                          for(let p = 1; p < cls.nSeats; p++){
                              const seat : seats = await prisma.seats.create({
                                  data: {
                                      number: rowNumber.toString() + letter,
                                      flight_id: flight.id,
                                      class_id: cls.id,
                                      state: seatstate.AVAILABLE,
                                      price: Number(flight.base_price) * Number(cls.price_multiplier) 
                                  }
                              })

                              const pseudoRandom : number = letter.toUpperCase().charCodeAt(0) - 64 + rowNumber;

                              if(pseudoRandom % 2 == 0){
                                await prisma.tickets.create({
                                    data: {
                                        passenger_id : passenger.id,
                                        purchase_date : subDays(flight.departure_time, pseudoRandom),
                                        final_cost : Number(seat.price),
                                        state: bookingstate.CONFIRMED,
                                        seat_id: seat.id,
                                        flight_id: flight.id
                                    }
                                })
                              }
          
                              letter = String.fromCharCode(letter.charCodeAt(0) + 1);
                              if (letter === 'G') {
                                  rowNumber += 1;
                                  letter = 'A';
                              }
                          }
                      }

        }
    //   }
    }
  }

  console.log(`✅ Flights seeded!`);
}
