import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AirlineRoute, Route } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private routesCache: AirlineRoute[] | null = null;
  private routesCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minutes

  constructor(private http : HttpClient) { }

  getRoutes(forceRefresh = false) : Observable<Response<AirlineRoute[]>> {
    const now = Date.now();
    if (!forceRefresh && this.routesCache && this.routesCacheTimestamp && (now - this.routesCacheTimestamp < this.cacheTTL)) {
      return of({
        success: true,
        message: 'Cached routes',
        data: this.routesCache
      });
    }

    return this.http.get<Response<AirlineRoute[]>>(`${enviroment.apiUrl}/airlines/routes`).pipe(
      tap(res => {
        if(res && res.success) {
          this.routesCache = res.data || [];
          this.routesCacheTimestamp = Date.now();
        }
      })
    );
  }

    getRoutesCountAll() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/routes-count-all`);
  }

  addRoute(route : Route){
    return this.http.post<Response<AirlineRoute>>(`${enviroment.apiUrl}/airlines/routes`, route).pipe(
      tap(res => {
        if(res && res.success && res.data){
          if(!this.routesCache){
            this.routesCache = [];
            this.routesCache.push(res.data);
          }
          this.routesCacheTimestamp = Date.now();
        }
      })
    );
  }

  deleteRoute(routeId : number){
    this.clearRoutesCache();
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/airlines/routes/${routeId}`)
  }

  getRoutesCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/routes-count`);
  }

  clearRoutesCache(){
    this.routesCache = null;
    this.routesCacheTimestamp = null;
  }
}
