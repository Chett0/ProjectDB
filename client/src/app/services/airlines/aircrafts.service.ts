import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AircraftWithClasses, CreateAircraft } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AirlinesService } from './airlines.service';

@Injectable({
  providedIn: 'root'
})
export class AircraftsService {
  private aircraftsCache: AircraftWithClasses[] | null = null;
  private aircraftsCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minutes

  constructor(private http : HttpClient, private airlinesService: AirlinesService) { }

  getAircrafts(forceRefresh = false): Observable<Response<AircraftWithClasses[]>> {
    const now = Date.now();
    if (!forceRefresh && this.aircraftsCache && this.aircraftsCacheTimestamp && (now - this.aircraftsCacheTimestamp < this.cacheTTL)) {
      return of({
        success: true,
        message: 'Cached aircrafts',
        data: this.aircraftsCache
      });
    }
    return this.http.get<Response<AircraftWithClasses[]>>(`${enviroment.apiUrl}/v1/airline/aircrafts`).pipe(
      tap(res => {
        if(res.success) {
          this.aircraftsCache = res.data || [];
          this.aircraftsCacheTimestamp = Date.now();
        }
      })
    );
  }

  addAircraft(aircraft: CreateAircraft) : Observable<Response<AircraftWithClasses>> {
    return this.http.post<Response<AircraftWithClasses>>(`${enviroment.apiUrl}/v1/airline/aircrafts`, aircraft).pipe(
      tap((res : Response<AircraftWithClasses>) => {
        if(res.success && res.data){
          if(!this.aircraftsCache)
            this.aircraftsCache = [];
          this.aircraftsCache.push(res.data);
          this.aircraftsCacheTimestamp = Date.now();
        } 
      })
    );
  }

  deleteAircraft(aircraftId: number) {
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/v1/airline/aircrafts/${aircraftId}`).pipe(
      tap((res: Response<void>) => {
        if(res.success)
          this.airlinesService.clearFlightsCache();
          this.clearAircraftsCache();
      })
    );
  }

  clearAircraftsCache(){
    this.aircraftsCache = null;
    this.aircraftsCacheTimestamp = null;
  }
}
