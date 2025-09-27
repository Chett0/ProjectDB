
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { PassengerService } from '../../services/passenger/passenger.service';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PassengersResolver implements Resolve<any> {
  constructor(
    private passengerService: PassengerService,
    private ticketBookingService: TicketBookingService
  ) {}

  resolve(): Observable<any> {
    return forkJoin({
      passenger: this.passengerService.getPassengerInfo().pipe(
        catchError(() => of({ name: '', surname: '', user: { email: '' } }))
      ),
      tickets: this.ticketBookingService.getTickets(1, 10).pipe(
        catchError(() => of({ tickets: [] }))
      )
    });
  }
}
