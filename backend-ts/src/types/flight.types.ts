interface Sort {
    sortBy : string,
    order: string
}


interface SearchFlightsParams {
    sort: Sort,
    departureAiportCity : string,
    arrivalAirportCity : string,
    layovers: number,
    departureDate: string,
    maxPrice: number
}


export type {
    Sort,
    SearchFlightsParams
}