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

  constructor(private http : HttpClient) { }

  getRoutes() : Observable<Response<AirlineRoute[]>> {
    if (this.routesCache) {
      return of({ 
        success: true,
        message: 'Cached routes',
        data: this.routesCache 
      });
    }
    return this.http.get<Response<AirlineRoute[]>>(`${enviroment.apiUrl}/airlines/routes`).pipe(
      tap(res => {
        if(res && res.success)
          this.routesCache = res.data || [];
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
        }
      })
    );
  }

  deleteRoute(routeId : number){
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/airlines/routes/${routeId}`)
  }

  getRoutesCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/routes-count`);
  }

  clearCache(){
    this.routesCache = null;
  }
}
