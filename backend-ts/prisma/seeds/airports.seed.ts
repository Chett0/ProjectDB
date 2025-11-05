import prisma from "./seed";

import fs from "fs";
import csv from "csv-parser";

export async function seedAirports() {
  console.log("🛫 Starting seeding airports...");

  fs.createReadStream("prisma/seeds/data/airports.csv")
    .pipe(csv())
    .on("data", async (airport) => {

      if (airport && airport.iata != "" && airport.city != "") {
        await prisma.airports.upsert({
          where: { iata: airport.iata },
          update: {},
          create: {
            name: airport.name,
            city: airport.city,
            subd: airport.subd,
            country: airport.country,
            iata: airport.iata,
            icao: airport.icao,
            lat: airport.lat,
            lon: airport.lon,
            tz: airport.tz,
          },
        });
      }
    })
    .on("end", () => {
        console.log("✅ Airports seeded");
    });
}
