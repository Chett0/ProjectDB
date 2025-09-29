import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private passengerCache: any = null;
  private passengerCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; 

  constructor(private http: HttpClient) { }

  getPassengerInfo(forceRefresh = false): Observable<any> {
    const now = Date.now();
    if (!forceRefresh && this.passengerCache && this.passengerCacheTimestamp && (now - this.passengerCacheTimestamp < this.cacheTTL)) {
      return of(this.passengerCache);
    }
    const token = localStorage.getItem('access_token');
    return this.http.get<any>(`${enviroment.apiUrl}/passengers/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      tap(data => {
        this.passengerCache = data;
        this.passengerCacheTimestamp = Date.now();
      })
    );
  }

  clearPassengerCache() {
    console.log('clearing cache...')
    this.passengerCache = null;
    this.passengerCacheTimestamp = null;
  }
}
