import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Aircraft, Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from '../../../types/responses/responses';
import { Airline, AirlineDashBoard, CreateExtra, Extra } from '../../../types/users/airlines';
import { CreateFlight, Flight } from '../../../types/flights/flights';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {
  private flightCache: Flight[] | null = null;
  private flightCacheTimestamp: number | null = null;

  clearFlightsCache() {
    this.flightCache = null;
    this.flightCacheTimestamp = null;
  }
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minuti

  constructor(private http : HttpClient) { }

  getAirlinesInfo() {
    return this.http.get<Response<Airline>>(`${enviroment.apiUrl}/v1/airline/me`);
  }

  getAllAirlines() {
    return this.http.get<Response<Airline[]>>(`${enviroment.apiUrl}/v1/airlines`);
  }

  getDashboardStats() {
    return this.http.get<Response<AirlineDashBoard>>(`${enviroment.apiUrl}/v1/airline/dashboard_stats`);
  }

  createFlight(newFlight: CreateFlight) : Observable<Response<Flight>> {
    return this.http.post<Response<Flight>>(`${enviroment.apiUrl}/v1/airline/flights`, newFlight).pipe(
      tap((res : Response<Flight>) => {
        if(res.success && res.data) {
          if(!this.flightCache)
            this.flightCache = [];
          this.flightCache.push(res.data);
          this.flightCacheTimestamp = Date.now();
        }
      })
    );
  }


  getAirlinesFlights(
    page: number = 1,
    limit: number = 10,
    filters?: { q?: string; maxPrice?: number; sortBy?: string; order?: string }
  ): Observable<Response<{ flights: Flight[]; total: number; page: number; limit: number }>> {
    type FlightsPayload = { flights: Flight[]; total: number; page: number; limit: number };

    const paramsArr: string[] = [];
    paramsArr.push(`page=${page}`);
    paramsArr.push(`limit=${limit}`);
    if (filters) {
      if (filters.q !== undefined && filters.q !== null && String(filters.q).trim() !== '') {
        paramsArr.push(`q=${encodeURIComponent(String(filters.q))}`);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null && !isNaN(Number(filters.maxPrice))) {
        paramsArr.push(`maxPrice=${Number(filters.maxPrice)}`);
      }
      if (filters.sortBy) {
        paramsArr.push(`sortBy=${encodeURIComponent(filters.sortBy)}`);
      }
      if (filters.order) {
        paramsArr.push(`order=${encodeURIComponent(filters.order)}`);
      }
    }
    const params = paramsArr.length ? `?${paramsArr.join('&')}` : '';
    return this.http.get<Response<FlightsPayload>>(`${enviroment.apiUrl}/v1/airline/flights${params}`);
  }

}
