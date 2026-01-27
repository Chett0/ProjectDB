import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';
import { SeatInfo } from '../../../types/flights/flights';
import { Response } from '../../../types/responses/responses';


@Injectable({
  providedIn: 'root'
})
export class SeatsService {

  constructor(private http: HttpClient) { }

  getSeats(flightId: number): Observable<Response<SeatInfo[]>> {
    return this.http.get<Response<SeatInfo[]>>(`${enviroment.apiUrl}/flights/${flightId}/seats`);
  }
}
