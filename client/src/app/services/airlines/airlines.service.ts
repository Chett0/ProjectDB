import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aircraft, Route } from '../../../types/users/airlines';
import { enviroment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {

  constructor(private http : HttpClient) { }

  getAirlinesInfo() {
    return this.http.get<any>(`${enviroment.apiUrl}/airlines/me`);
  }


  getAircrafts(){
    return this.http.get<Aircraft[]>(`${enviroment.apiUrl}/aircrafts`);
  }

  getRoutes(){
    return this.http.get<any>(`${enviroment.apiUrl}/routes`);
  }

  deleteAircraft(aircraftId: number) {
    return this.http.delete<any>(`${enviroment.apiUrl}/aircrafts/${aircraftId}`);
  }

  addRoute(route : Route){
    return this.http.post<any>(`${enviroment.apiUrl}/routes`, route);
  }

  deleteRoute(routeId : number){
    return this.http.delete<any>(`${enviroment.apiUrl}/routes/${routeId}`)
  }

  addAircraft(aircraft: { model: string; nSeats: number; classes?: any[] }) {
    return this.http.post<any>(`${enviroment.apiUrl}/aircrafts`, aircraft);
  }
}
