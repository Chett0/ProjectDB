import prisma from "./seed";
import { userrole } from '@prisma/client';
import { hashPassword } from "../../src/utils/helpers/auth.helpers";

export async function seedUsers() {
  console.log("👨‍💼 Seeding admin, airlines, and passengers...");

  const ADMIN = [{ email: "admin@example.com", password: "admin" }];

  for (const admin of ADMIN) {
    await prisma.users.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        password: await hashPassword(admin.password),
        role: userrole.ADMIN,
      },
    });
  }

  console.log("👨‍💼 Admin created");

  const AIRLINES = [
    { name: "Lufthansa", code: "LH" },
    { name: "Ryanair", code: "FR" },
    // { name: "Air France", code: "AF" },
    // { name: "Emirates", code: "EK" },
    // { name: "Qatar Airways", code: "QR" },
  ];

  for (const airline of AIRLINES) {
    let email: string = `${airline.name
      .toLowerCase()
      .replace(/\s+/g, "")}@example.com`;
    await prisma.users.upsert({
      where: { email: email },
      update: {},
      create: {
        email: email,
        password: await hashPassword(airline.name),
        role: userrole.AIRLINE,
        airlines: {
          create: {
            name: airline.name,
            code: airline.code,
          },
        },
      },
    });
  }

  console.log(`✈️ Airlines created`);

  const PASSENGERS = [
    "test"
  ];

  for (const passenger of PASSENGERS) {
    let email: string = `${passenger.toLowerCase()}@example.com`;
    await prisma.users.upsert({
      where: { email: email },
      update: {},
      create: {
        email: email,
        password: await hashPassword("test"),
        role: userrole.AIRLINE,
        passengers: {
          create: {
            name: passenger,
            surname: passenger,
          },
        },
      },
    });
  }

  console.log(`🧳 Passenger created`);

  console.log("✅ Users, airlines, and passengers seeded!");
}
