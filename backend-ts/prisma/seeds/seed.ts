import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { seedAircrafts } from './aircrafts.seed';
import { seedAirports } from './airports.seed';
import { seedExtras } from './extras.seed';
import { seedRoutes } from './routes.seed';
import { seedUsers } from './users.seed';
import { seedFlights } from './flights.seed';

async function main() {
  console.log("🌱 Starting seeding...");

  try {
    const existingFlights = await prisma.flights.count();
    const existingAirports = await prisma.airports.count();

    if (existingFlights> 0 || existingAirports > 0) {
      console.log('ℹ️ Database already seeded — skipping seeding.');
      await prisma.$disconnect();
      return;
    }
  } catch (err) {
    console.warn('⚠️ Unable to perform pre-seed checks, proceeding with seeding.', err);
  }

  await seedAirports();
  await seedUsers();
  await seedAircrafts();
  await seedExtras();
  await seedRoutes();
  await seedFlights();
  console.log("🌾 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });


export default prisma;