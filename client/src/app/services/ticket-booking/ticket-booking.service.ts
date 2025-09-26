import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TicketBookingService {
  private ticketsCache: { [key: string]: any } | null = null; 
  constructor(private http: HttpClient) { }

  buyTicket(flightId: number, finalCost: number, seatNumber: string, extras: number[]): Observable<any> {
    const url = `${enviroment.apiUrl}/tickets`;

    const body = {
      flight_id: flightId,
      final_cost: finalCost,
      seat_number: seatNumber,
      extras: extras
    };

    return this.http.post(url, body).pipe(
      tap(() => this.clearTicketsCache())
    );
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

    return this.http.post(url, body).pipe(
      tap(() => this.clearTicketsCache())
    );
  }


  getTickets(page: number = 1, limit: number = 10): Observable<any> {
    const key = `${page}_${limit}`;
    if (this.ticketsCache && this.ticketsCache[key]) {
      return of(this.ticketsCache[key]);
    }

    const url = `${enviroment.apiUrl}/tickets?page=${page}&limit=${limit}`;
    return this.http.get<any>(url).pipe(
      tap(data => {
        if (!this.ticketsCache) this.ticketsCache = {};
        this.ticketsCache[key] = data;
      })
    );
  }

  clearTicketsCache(){
    this.ticketsCache = null;
  }
}