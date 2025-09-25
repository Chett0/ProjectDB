import { TestBed } from '@angular/core/testing';

import { TicketBookingService } from './ticket-booking.service';

describe('TicketBookingService', () => {
  let service: TicketBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
