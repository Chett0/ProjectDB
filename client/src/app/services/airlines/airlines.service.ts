import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Aircraft, Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminDashboard } from '../../../types/users/admin';
import { Response } from '../../../types/responses/responses';
import { Airline, AirlineDashBoard, CreateExtra, Extra } from '../../../types/users/airlines';
import { CreateFlight, Flight } from '../../../types/flights/flights';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {
  private extrasCache: any[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  private flightCache: Flight[] | null = null;
  private flightCacheTimestamp: number | null = null;


  clearExtrasCache() {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
  }
  clearFlightsCache() {
    this.flightCache = null;
    this.flightCacheTimestamp = null;
  }
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minuti

  constructor(private http : HttpClient) { }

  getAirlinesInfo() {
    return this.http.get<any>(`${enviroment.apiUrl}/airlines/me`);
  }

  getAllAirlines() {
    return this.http.get<Response<Airline[]>>(`${enviroment.apiUrl}/admin/airlines`);
  }

  getDashboardStats() {
    return this.http.get<Response<AirlineDashBoard>>(`${enviroment.apiUrl}/airlines/dashboard-stats`);
  }

  getAdminDashboardStats() {
    return this.http.get<Response<AdminDashboard>>(`${enviroment.apiUrl}/admin/dashboard-stats`);
  }

  createFlight(newFlight: CreateFlight) : Observable<Response<Flight>> {
    return this.http.post<any>(`${enviroment.apiUrl}/airlines/flights`, newFlight).pipe(
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


  getAirlinesFlights() : Observable<Response<Flight[]>> {
    const now = Date.now();
    if (this.flightCache && this.flightCacheTimestamp && (now - this.flightCacheTimestamp < this.cacheTTL)) {
      return of({ 
        success: true,
        message: 'Flights retrieved successfully (cache)', 
        data: this.flightCache 
      });
    }
    return this.http.get<Response<Flight[]>>(`${enviroment.apiUrl}/airlines/flights`).pipe(
      tap((res : Response<Flight[]>) => {
        if(res.success && res.data) {
          this.flightCache = res.data;
          this.flightCacheTimestamp = Date.now();
        }
      })
    );
  }

  createExtra(extra: CreateExtra) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.post<Response<Extra>>(`${enviroment.apiUrl}/airlines/extras`, extra);
  }

  getExtras(forceRefresh = false): Observable<Response<Extra[]>> {
    const now = Date.now();
    if (!forceRefresh && this.extrasCache && this.extrasCacheTimestamp && (now - this.extrasCacheTimestamp < this.cacheTTL)) {
      return of({ 
        success: true,
        message: 'Extras retrieved successfully (cache)', 
        data: this.extrasCache 
      });
    }
    return this.http.get<Response<Extra[]>>(`${enviroment.apiUrl}/airlines/extras`).pipe(
      tap((res : Response<Extra[]>) => {
        if (res && res.data) {
          this.extrasCache = res.data;
          this.extrasCacheTimestamp = Date.now();
        }
      })
    );
  }

  deleteExtra(extraId: number) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/airlines/extras/${extraId}`);
  }
}
