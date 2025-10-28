class AdminDashBoardDTO {
    passengersCount: number;
    airlinesCount: number;
    activeRoutesCount: number;
    flightsCount: number;

    constructor(passengerCount: number, airlinesCount: number, activeRoutesCount: number, flightsCount: number) {
        this.passengersCount = passengerCount;
        this.airlinesCount = airlinesCount;
        this.activeRoutesCount = activeRoutesCount;
        this.flightsCount = flightsCount;
    }
}

export {
    AdminDashBoardDTO
}