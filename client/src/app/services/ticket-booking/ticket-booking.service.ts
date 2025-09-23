import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TicketBookingService {

  constructor(private http: HttpClient) {}

   buyTicket(flightId: number, finalCost: number, seatNumber: string, extras: number[]): Observable<any> {
    const url = `${enviroment.apiUrl}/tickets`;

    const body = {
      flight_id: flightId,
      final_cost: finalCost,
      seat_number: seatNumber,
      extras: extras
    };

    return this.http.post(url, body);
  }
}
