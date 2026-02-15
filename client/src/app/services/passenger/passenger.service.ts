import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PassengerInfo } from '../../../types/users/passenger';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {

  private passengerCache: PassengerInfo | null = null;
  private passengerCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; 

  constructor(private http: HttpClient) { }

  getPassengerInfo(forceRefresh = false): Observable<Response<PassengerInfo>> {
    const now = Date.now();
    if (!forceRefresh && this.passengerCache && this.passengerCacheTimestamp && (now - this.passengerCacheTimestamp < this.cacheTTL)) {
      return of({ 
        success: true,
        message: 'Fetched from cache',
        data: this.passengerCache 
      });
    }
    return this.http.get<Response<PassengerInfo>>(`${enviroment.apiUrl}/v1/passenger/me`).pipe(
      tap(res => {
        if(res.success){
          this.passengerCache = res.data || null;
          this.passengerCacheTimestamp = Date.now();
        }
      })
    );
  }

  updatePassenger(data: Partial<PassengerInfo>): Observable<Response<PassengerInfo>> {
    return this.http.put<Response<PassengerInfo>>(`${enviroment.apiUrl}/v1/passenger`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.passengerCache = res.data;
          this.passengerCacheTimestamp = Date.now();
        }
      })
    );
  }

  getPassengerStats(): Observable<Response<{ totalFlights: number; flightHours: { hours: number; minutes: number }; moneySpent: number }>> {
    return this.http.get<Response<{ totalFlights: number; flightHours: { hours: number; minutes: number }; moneySpent: number }>>(`${enviroment.apiUrl}/v1/passenger/dashboard_stats`);
  }

  clearPassengerCache() {
    this.passengerCache = null;
    this.passengerCacheTimestamp = null;
  }
}
