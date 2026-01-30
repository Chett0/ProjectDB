import prisma from "./seed";
import { aircrafts, airlines } from '@prisma/client';

interface AircraftData {
    model: string,
    nSeats : number
}

interface AircraftClassData {
    name: string,
    percNSeats : number,
    priceMultiplier : number
}

export async function seedAircrafts() {

    console.log(`✈️ Seeding aircrafts...`);
  
    const aircraftsData : AircraftData[] = [
    {
      model: 'Airbus A320',
      nSeats: 180,
    },
    {
      model: 'Boeing 737-800',
      nSeats: 200,
    },
    {
      model: 'Embraer E190',
      nSeats: 100,
    },
    {
      model: 'Airbus A350-900',
      nSeats: 320,
    },
    {
      model: 'Boeing 787-9 Dreamliner',
      nSeats: 250,
    },
  ];

  const aircraftClassesData : AircraftClassData[] = [
    {
      name : "First Class",
      percNSeats : 10,
      priceMultiplier : 1.5
    },
    {
      name : "Business",
      percNSeats : 30,
      priceMultiplier : 1.25
    },
    {
      name : "Economy",
      percNSeats : 60,
      priceMultiplier : 1.0
    },
  ]

  const airlines : airlines[] = await prisma.airlines.findMany();

  await prisma.$transaction(async tx => {
    for (const airline of airlines) {
      for (const aircraft of aircraftsData) {
        const ac = await tx.aircrafts.upsert({
          where: {
            airline_id_model: {
              model: aircraft.model,
              airline_id: airline.id,
            },
          },
          update: {},
          create: {
            model: aircraft.model,
            nSeats: aircraft.nSeats,
            airline_id: airline.id,
          },
        });

        for (const cls of aircraftClassesData) {
          await tx.aircraft_classes.upsert({
            where: {
              aircraft_id_name: {
                aircraft_id: ac.id,
                name: cls.name,
              },
            },
            update: {},
            create: {
              name: cls.name,
              nSeats: Math.floor(aircraft.nSeats * cls.percNSeats / 100),
              price_multiplier: cls.priceMultiplier,
              aircraft_id: ac.id,
            },
          });
        }
      }
    }
  });

  console.log(`✅ Aircrafts seeded!`);

}