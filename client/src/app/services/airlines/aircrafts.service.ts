import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aircraft, AircraftWithClasses, CreateAircraft } from '../../../types/users/airlines';
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

  constructor(private http : HttpClient, private airlinesService: AirlinesService) { }

  getAircrafts(): Observable<Response<AircraftWithClasses[]>> {
    if (this.aircraftsCache) {
      return of({
        success: true,
        message: 'Cached aircrafts',
        data: this.aircraftsCache
      });
    }
    return this.http.get<Response<AircraftWithClasses[]>>(`${enviroment.apiUrl}/airlines/aircrafts`).pipe(
      tap(res => {
        if(res.success)
          this.aircraftsCache = res.data || [];
      })
    );
  }

  addAircraft(aircraft: CreateAircraft) : Observable<Response<AircraftWithClasses>> {
    return this.http.post<Response<AircraftWithClasses>>(`${enviroment.apiUrl}/airlines/aircrafts`, aircraft).pipe(
      tap((res : Response<AircraftWithClasses>) => {
        if(res.success && res.data){
          if(!this.aircraftsCache)
            this.aircraftsCache = [];
          this.aircraftsCache.push(res.data);
        } 
      })
    );
  }

  deleteAircraft(aircraftId: number) {
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/airlines/aircrafts/${aircraftId}`).pipe(
      tap((res: Response<void>) => {
        if(res.success)
          this.airlinesService.clearFlightsCache();
      })
    );
  }

  clearCache(){
    this.aircraftsCache = null;
  }
}
