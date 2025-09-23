import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Aircraft, Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {
  private extrasCache: any[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minuti

  constructor(private http : HttpClient) { }

  getAirlinesInfo() {
    return this.http.get<any>(`${enviroment.apiUrl}/airlines/me`);
  }

  getAllAirlines() {
    return this.http.get<any>(`${enviroment.apiUrl}/airlines`);
  }

  getAirlinesCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/airlines/count`);
  }

  getFlightsCountAll() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/count-all`);
  }
  
  getAirlineFlightsCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/count`);
  }

  getPassengersCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/passengers/count`);
  }

  createExtra(extra: { name: string; price: number }) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.post<any>(`${enviroment.apiUrl}/airlines/extras`, extra);
  }

  getExtras(forceRefresh = false): Observable<any> {
    const now = Date.now();
    if (!forceRefresh && this.extrasCache && this.extrasCacheTimestamp && (now - this.extrasCacheTimestamp < this.cacheTTL)) {
      return of({ message: 'Extras retrieved successfully (cache)', extras: this.extrasCache });
    }
    return this.http.get<any>(`${enviroment.apiUrl}/airline/extras`).pipe(
      tap(res => {
        if (res && res.extras) {
          this.extrasCache = res.extras;
          this.extrasCacheTimestamp = Date.now();
        }
      })
    );
  }

  deleteExtra(extraId: number) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.delete<any>(`${enviroment.apiUrl}/airlines/extras/${extraId}`);
  }
}
