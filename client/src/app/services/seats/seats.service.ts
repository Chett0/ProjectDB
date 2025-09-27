import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';


@Injectable({
  providedIn: 'root'
})
export class SeatsService {

  constructor(private http: HttpClient) { }

  get_seats(flightId: string): Observable<any> {
    return this.http.get<any>(`${enviroment.apiUrl}/flights/${flightId}/seats`);
  }
}
