import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private routesCache: any[] | null = null;
  clearCache() {
    this.routesCache = null;
  }

  constructor(private http : HttpClient) { }

  getRoutes() {
    if (this.routesCache) {
      return of({ routes: this.routesCache });
    }
    return this.http.get<any>(`${enviroment.apiUrl}/routes`).pipe(
      tap(data => {
        const list = Array.isArray(data) ? data : (data as any)?.routes ?? [];
        this.routesCache = list;
      })
    );
  }

    getRoutesCountAll() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/routes-count-all`);
  }

  addRoute(route : Route){
    this.routesCache = null;
    return this.http.post<any>(`${enviroment.apiUrl}/routes`, route);
  }

  deleteRoute(routeId : number){
    this.routesCache = null;
    return this.http.delete<any>(`${enviroment.apiUrl}/routes/${routeId}`)
  }

  getRoutesCount() {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/routes-count`);
  }
}
