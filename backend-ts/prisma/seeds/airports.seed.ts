import prisma from "./seed";

import fs from "fs";
import csv from "csv-parser";

export async function seedAirports() {
  console.log("🛫 Starting seeding airports...");

  const airports: any[] = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream("prisma/seeds/data/airports.csv")
      .pipe(csv())
      .on("data", (airport) => {
        if (airport && airport.iata !== "" && airport.city !== "") {
          airports.push(airport);
        }
      })
      .on("error", reject)
      .on("end", resolve);
  });

  console.log(`📊 Airports loaded from csv...`);

  const batchSize = 100;
  for (let i = 0; i < airports.length; i += batchSize) {
    const batch = airports.slice(i, i + batchSize);
    await Promise.all(
      batch.map((airport) =>
        prisma.airports.upsert({
          where: { iata: airport.iata },
          update: {},
          create: {
            name: airport.name,
            city: airport.city,
            subd: airport.subd,
            country: airport.country,
            iata: airport.iata,
            icao: airport.icao,
            lat: parseFloat(airport.lat),
            lon: parseFloat(airport.lon),
            tz: airport.tz,
          },
        })
      )
    );
  }
  
  console.log("✅ All airports seeded successfully!");
}
