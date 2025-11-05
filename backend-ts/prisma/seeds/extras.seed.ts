import prisma from "./seed";
import { airlines } from '@prisma/client';

interface ExtrasData {
    name: string,
    price : number
}

export async function seedExtras() {

    console.log('🎁 Seeding extras...');


  
    const extrasData : ExtrasData[] = [
    { name: 'Extra baggage (20kg)', price: 35.00},
    { name: 'Seat with extra legroom', price: 15.00},
    { name: 'In-flight meal', price: 10.00},
    { name: 'Priority boarding', price: 8.50},
    { name: 'Wi-Fi access', price: 5.99},
    ];

  const airlines : airlines[] = await prisma.airlines.findMany();

  for(const airline of airlines){
    for(const extra of extrasData){
        await prisma.extras.upsert({
            where : {
                airline_id_name : {
                    name : extra.name,
                    airline_id: airline.id
                }
            },
            update : {},
            create : {
                name : extra.name,
                price: extra.price,
                airline_id : airline.id
            }
        });
    }
  }

  console.log(`✅ Extras seeded!`);

}