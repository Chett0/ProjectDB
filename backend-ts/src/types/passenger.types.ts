export enum BookingState {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED"
}

export interface Ticket {
    flightId : number,
    passengerId : number,
    seatNumber: string,
    finalCost : number,
    state: BookingState,
    purchaseDate: Date
}
