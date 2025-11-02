import { Decimal } from "@prisma/client/runtime/library";
import { AirportDTO } from "./airport.dto";
import { aircraft_classes, aircrafts, airports, extras } from "../../prisma/generated/prisma";

class AirlineRouteDTO {
    id: number;
    departureAirport: AirportDTO;
    arrivalAirport: AirportDTO;

    constructor(id: number, departureAirport: AirportDTO, arrivalAirport: AirportDTO) {
        this.id = id;
        this.departureAirport = departureAirport;
        this.arrivalAirport = arrivalAirport;
    }

    // static fromPrisma(route: AirlineRouteDTO, departureAirport: airports, arrivalAirport: airports): AirlineRouteDTO {
    //     return new AirlineRouteDTO(
    //         route.id,
    //         AirportDTO.fromPrisma(departureAirport),
    //         AirportDTO.fromPrisma(arrivalAirport)
    //     );
    // }

    // static fromPrismaList(list: { route: airline_routes; departureAirport: airports; arrivalAirport: airports }[]): AirlineRouteDTO[] {
    //     return list.map(item => AirlineRouteDTO.fromPrisma(item.route, item.departureAirport, item.arrivalAirport));
    // }

    static fromPrismaDTO(route: AirlineRouteDTO, departureAirport: AirportDTO, arrivalAirport: AirportDTO): AirlineRouteDTO {
        return new AirlineRouteDTO(
            route.id,
            departureAirport,
            arrivalAirport
        );
    }
}

class ExtraDTO {
    id: number;
    name: string;
    price: Decimal;

    constructor(id: number, name: string, price: Decimal) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    static fromPrisma(extra: extras): ExtraDTO {
        return new ExtraDTO(
            extra.id,
            extra.name,
            extra.price
        );
    }

    static fromPrismaList(list: extras[]): ExtraDTO[] {
        return list.map(ExtraDTO.fromPrisma);
    }
}

class DashBoardDTO {
    passengerCount: number;
    monthlyIncome: number;
    activeRoutes: number;
    flightsInProgress: number;

    constructor(passengerCount: number, monthlyIncome: number, activeRoutes: number, flightsInProgress: number) {
        this.passengerCount = passengerCount;
        this.monthlyIncome = monthlyIncome;
        this.activeRoutes = activeRoutes;
        this.flightsInProgress = flightsInProgress;
    }
}

class ClassDTO {

    id: number;
    name: string;
    nSeats: number;
    priceMultiplier: number;

    constructor(id: number, name: string, nSeats: number, priceMultiplier: number){
        this.id = id;
        this.name = name;
        this.nSeats = nSeats;
        this.priceMultiplier = priceMultiplier;
    }

    static fromPrisma(aircraftClass: aircraft_classes): ClassDTO {
        return new ClassDTO(
            aircraftClass.id,
            aircraftClass.name,
            aircraftClass.nSeats,
            Number(aircraftClass.price_multiplier)
        );
    }

    static fromPrismaList(list: aircraft_classes[]): ClassDTO[] {
        return list.map(ClassDTO.fromPrisma);
    }
}

class AircraftDTO {
    id: number;
    model: string;
    nSeats: number;
    classes: ClassDTO[];

    constructor(id: number, model: string, nSeats: number, classes: ClassDTO[]) {
        this.id = id;
        this.model = model;
        this.nSeats = nSeats;
        this.classes = classes;
    }

    static fromPrisma(aircraft: aircrafts, classes: aircraft_classes[]): AircraftDTO {
        return new AircraftDTO(
            aircraft.id,
            aircraft.model,
            aircraft.nSeats,
            ClassDTO.fromPrismaList(classes)
        );
    }

    static fromPrismaDTO(aircraft: aircrafts, classes: ClassDTO[]): AircraftDTO {
        return new AircraftDTO(
            aircraft.id,
            aircraft.model,
            aircraft.nSeats,
            classes
        );
    }

    static fromPrismaList(list: { aircraft: aircrafts; classes: aircraft_classes[] }[]): AircraftDTO[] {
        return list.map(item => AircraftDTO.fromPrisma(item.aircraft, item.classes));
    }
}

class AircraftInfoDTO {
    id: number;
    model: string;
    nSeats: number;

    constructor(id: number, model: string, nSeats: number) {
        this.id = id;
        this.model = model;
        this.nSeats = nSeats;
    }

    static fromPrisma(aircraft : aircrafts): AircraftInfoDTO {
        return new AircraftInfoDTO(
            aircraft.id,
            aircraft.model,
            aircraft.nSeats
        );
    }

    static fromPrismaList(list: aircrafts[]): AircraftInfoDTO[] {
        return list.map(AircraftInfoDTO.fromPrisma);
    }
}

export {
    ClassDTO,
    ExtraDTO,
    DashBoardDTO,
    AircraftDTO,
    AircraftInfoDTO,
    AirlineRouteDTO
}