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
}
