import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { PassengersResolveData } from '../../../types/users/passenger';
import { PassengerService } from '../../services/passenger/passenger.service';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PassengersResolver implements Resolve<PassengersResolveData> {
  constructor(
    private passengerService: PassengerService,
    private ticketBookingService: TicketBookingService
  ) {}

  resolve(): Observable<PassengersResolveData> {
    return forkJoin({
      passengerResponse: this.passengerService.getPassengerInfo().pipe(),
      tickets: this.ticketBookingService.getTickets(1, 5).pipe(
        catchError(() => of({ success: false, message: 'Failed to load tickets', data: { tickets: [] } } as PassengersResolveData['tickets']) )
      )
    });
  }
}
