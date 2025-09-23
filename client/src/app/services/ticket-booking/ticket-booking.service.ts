import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TicketBookingService {

  constructor(private http: HttpClient) {}

   buyTicket(flightId: number, finalCost: number, seatNumber: string, extras: number[], token: string): Observable<any> {
    const url = `${enviroment.apiUrl}/tickets`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      flight_id: flightId,
      final_cost: finalCost,
      seat_number: seatNumber,
      extras: extras
    };

    return this.http.post(url, body, {headers});
  }
}
