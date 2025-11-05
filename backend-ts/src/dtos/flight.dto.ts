import { Decimal } from "@prisma/client/runtime/library";
import { flights, seatstate } from '@prisma/client';
import { ClassDTO } from "./airline.dto";

class FlightInfoDTO {
    id: number;
    departureTime: Date;
    arrivalTime: Date;
    basePrice: Decimal;

    constructor(id: number, departureTime: Date, arrivalTime: Date, basePrice : Decimal) {
        this.id = id;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.basePrice = basePrice;
    }

    static fromPrisma(flight : flights): FlightInfoDTO {
        return new FlightInfoDTO(
            flight.id,
            flight.departure_time,
            flight.arrival_time,
            flight.base_price
        );
    }

    static fromPrismaList(list: flights[]): FlightInfoDTO[] {
        return list.map(FlightInfoDTO.fromPrisma);
    }
}

class SeatsDTO {
    id: number;
    number: string;
    state: seatstate;
    price: number;
    class: ClassDTO;

    constructor(
    id: number,
    number: string,
    state: seatstate,
    price: number,
    seatClass: ClassDTO
  ) {
    this.id = id;
    this.number = number;
    this.state = state;
    this.price = price;
    this.class = seatClass;
  }

  
  static fromPrisma(seat: any): SeatsDTO {
    return new SeatsDTO(
      seat.id,
      seat.number,
      seat.state,
      seat.price,
      seat.class 
    );
  }

  
  static fromPrismaList(list: any[]): SeatsDTO[] {
    return list.map(SeatsDTO.fromPrisma);
  }
}

class JourneysInfoDTO {
    firstFlight : FlightInfoDTO;
    secondFlight? : FlightInfoDTO | null;
    totalDuration : number;
    totalPrice : Decimal;

    constructor(firstFlight : FlightInfoDTO, secondFlight : FlightInfoDTO | null = null, totalDuration : number, totalPrice : Decimal) {
        this.firstFlight = firstFlight;
        this.secondFlight = secondFlight;
        this.totalDuration = totalDuration;
        this.totalPrice = totalPrice;
    }
} 


export {
    FlightInfoDTO,
    JourneysInfoDTO,
    SeatsDTO
}