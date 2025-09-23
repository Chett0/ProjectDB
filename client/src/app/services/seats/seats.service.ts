import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';


@Injectable({
  providedIn: 'root'
})
export class SeatsService {

  constructor(private http: HttpClient) { }

  get_free_seats(flightId: string): Observable<any> {

    return this.http.get<any>(`${enviroment.apiUrl}/flights/free_seats`, {
      params: { flight_id : flightId }
    });
  }


  get_seats(flightId: string): Observable<any> {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/${flightId}/seats`);
  }
}
