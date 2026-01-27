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
    return this.http.get<Response<PassengerInfo>>(`${enviroment.apiUrl}/passengers/me`).pipe(
      tap(res => {
        if(res.success){
          this.passengerCache = res.data || null;
          this.passengerCacheTimestamp = Date.now();
        }
      })
    );
  }

  clearPassengerCache() {
    console.log('clearing cache...')
    this.passengerCache = null;
    this.passengerCacheTimestamp = null;
  }
}
