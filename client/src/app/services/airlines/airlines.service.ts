import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Aircraft, Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminDashboard } from '../../../types/users/admin';
import { Response } from '../../../types/responses/responses';
import { Airline, AirlineDashBoard, CreateExtra, Extra } from '../../../types/users/airlines';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {
  private extrasCache: any[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  private flightCache: any[] | null = null;
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

  
  getAirlineFlightsCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/count`);
  }

  getPassengersCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/passengers/count`);
  }

  getDashboardStats() {
    return this.http.get<Response<AirlineDashBoard>>(`${enviroment.apiUrl}/airlines/dashboard-stats`);
  }

  getAdminDashboardStats() {
    return this.http.get<Response<AdminDashboard>>(`${enviroment.apiUrl}/admin/dashboard-stats`);
  }

  createFlight(payload: { route_id: number; aircraft_id: number; departure_time: string; arrival_time: string; base_price: number }) {
    this.flightCache = null;
    this.flightCacheTimestamp = null;
    return this.http.post<any>(`${enviroment.apiUrl}/flights`, payload);
  }


  getAirlinesFlights() {
    const now = Date.now();
    if (this.flightCache && this.flightCacheTimestamp && (now - this.flightCacheTimestamp < this.cacheTTL)) {
      return of({ message: 'Flights retrieved successfully (cache)', flights: this.flightCache });
    }
    return this.http.get<any>(`${enviroment.apiUrl}/airline/flights`).pipe(
      tap(res => {
        const list = Array.isArray(res) ? res : (res as any)?.flights ?? [];
        this.flightCache = list;
        this.flightCacheTimestamp = Date.now();
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
      tap(res => {
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
