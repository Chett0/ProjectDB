import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aircraft } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AirlinesService } from './airlines.service';

@Injectable({
  providedIn: 'root'
})
export class AircraftsService {
  private aircraftsCache: Aircraft[] | null = null;


  constructor(private http : HttpClient, private airlinesService: AirlinesService) { }

  getAircrafts(): Observable<Aircraft[]> {
    if (this.aircraftsCache) {
      return of(this.aircraftsCache);
    }
    return this.http.get<Aircraft[]>(`${enviroment.apiUrl}/aircrafts`).pipe(
      tap(data => {
        const list = Array.isArray(data) ? data : (data as any)?.aircrafts ?? [];
        this.aircraftsCache = list;
      })
    );
  }

  addAircraft(aircraft: { model: string; nSeats: number; classes?: any[] }) {
    this.aircraftsCache = null;
    return this.http.post<any>(`${enviroment.apiUrl}/aircrafts`, aircraft).pipe(
      tap(() => {
        this.airlinesService.clearFlightsCache();
      })
    );
  }

  deleteAircraft(aircraftId: number) {
    this.aircraftsCache = null;
    return this.http.delete<any>(`${enviroment.apiUrl}/aircrafts/${aircraftId}`).pipe(
      tap(() => {
        this.airlinesService.clearFlightsCache();
      })
    );
  }

  getAircraftsCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/aircrafts/count`);
  }

  clearCache(){
    this.aircraftsCache = null;
  }
}
