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