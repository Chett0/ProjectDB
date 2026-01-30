import prisma from "./seed";
import { userrole } from '@prisma/client';
import { hashPassword } from "../../src/utils/helpers/auth.helpers";

export async function seedUsers() {
  console.log("👨‍💼 Seeding admin, airlines, and passengers...");

  const ADMIN = [{ email: "admin@example.com", password: "admin" }];

  for (const admin of ADMIN) {
    admin.password = await hashPassword(admin.password);
  }

  await Promise.all(
    ADMIN.map(async (admin) => {
      return await prisma.users.upsert({
        where: { email: admin.email },
        update: {
          email: admin.email,
          password: admin.password,
          role: userrole.ADMIN,
        },
        create: {
          email: admin.email,
          password: admin.password,
          role: userrole.ADMIN,
        },
      });
    })
  ).then(() => {
    console.log("👨‍💼 Admin created");
  });
  

  const AIRLINES : any[] = [
    { name: "Lufthansa", code: "LH" },
    { name: "Ryanair", code: "FR" },
    // { name: "Air France", code: "AF" },
    // { name: "Emirates", code: "EK" },
    // { name: "Qatar Airways", code: "QR" },
  ];

  for (const airline of AIRLINES) {
    airline["email"] = `${airline.name
      .toLowerCase()
      .replace(/\s+/g, "")}@example.com`;

    airline["password"] = await hashPassword(airline.name);
  }

  await Promise.all(
    AIRLINES.map(async (airline) => {
      return await prisma.users.upsert({
      where: { email: airline.email },
      update: {},
      create: {
        email: airline.email,
        password: airline.password,
        role: userrole.AIRLINE,
        airlines: {
          create: {
            name: airline.name,
            code: airline.code,
          },
        },
      },
    })
  })).then(() => {
    console.log("✈️ Airlines created");
  });

  const PASSENGERS : any[] = [
    { "name": "test" }
  ];

  for (const passenger of PASSENGERS) {
    passenger["email"] = `${passenger.name.toLowerCase()}@example.com`;
    passenger["password"] = await hashPassword(passenger.name);
  }

  await Promise.all(
    PASSENGERS.map(async (passenger) => {
      return await prisma.users.upsert({
      where: { email: passenger.email },
      update: {},
      create: {
        email: passenger.email,
        password: passenger.password,
        role: userrole.PASSENGER,
        passengers: {
          create: {
            name: passenger.name,
            surname: passenger.name,
          },
        },
      },
    });
  })).then(() => {
    console.log(`🧳 Passenger created`);
  });


  console.log("✅ Users, airlines, and passengers seeded!");
}
