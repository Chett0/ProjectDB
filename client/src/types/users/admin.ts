import { Response } from '../responses/responses';
import { Airline } from './airlines';

export interface AdminDashboard {
    passengersCount: number;
    airlinesCount: number;
    activeRoutesCount: number;
    flightsCount: number;
}


export interface AdminResolverResponse {
    airlinesResponse: Response<Airline[]>;
}