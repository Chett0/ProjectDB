interface FlightSeat {
    id: number, 
    departure_time: string,
    arrival_time: string
}

interface AircraftClassSeat {
    id: number,
    name: string,
    price_multiplier: number
}

interface Seat {
    id: number,
    seat_number: string,
    state: string,
    price: number,
    flight: FlightSeat,
    aircraft_class: AircraftClassSeat
}

export type {
    Seat
}