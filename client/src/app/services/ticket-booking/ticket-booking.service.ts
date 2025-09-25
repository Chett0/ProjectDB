import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TicketBookingService {

  constructor(private http: HttpClient) { }

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

  buyTickets(tickets: {
    flightId: number;
    finalCost: number;
    seatNumber: string;
    extras: number[];
  }[]): Observable<any> {
    const url = `${enviroment.apiUrl}/tickets/bulk`;

    const body = {
      tickets: tickets.map(t => ({
        flight_id: t.flightId,
        final_cost: t.finalCost,
        seat_number: t.seatNumber,
        extras: t.extras
      }))
    };

    return this.http.post(url, body);
  }
}