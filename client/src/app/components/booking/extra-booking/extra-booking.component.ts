import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Extra } from '../../../../types/users/airlines';
import { CreateTicket, Flight, Journeys, SeatInfo } from '../../../../types/flights/flights';
import { Response } from '../../../../types/responses/responses';
import { TicketService } from '../../../services/ticket/ticket.service';
import { ExtrasService } from '../../../services/airlines/extras.service';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { TicketBookingService } from '../../../services/ticket-booking/ticket-booking.service';

@Component({
  selector: 'app-extra',
  imports: [HeaderComponent, CommonModule],
  templateUrl: './extra-booking.component.html',
  styleUrl: './extra-booking.component.css'
})
export class ExtraBookingComponent implements OnInit{

  journey! : Journeys;
  selectedSeats! : Map<number, SeatInfo>;
  selectedExtras: Map<number, Extra[]> = new Map();
  extras: Map<number, Extra[]> = new Map();

  constructor(
    private ticketService: TicketService,
    private bookingService: TicketBookingService,  
    private extrasService: ExtrasService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.ticketService.journeys$.subscribe(journey => {
      if(!journey) {
        this.router.navigate(['/']);
        return;
      }

      this.journey = journey;

      journey.flights.forEach(flight => {
        this.extrasService.getExtras(flight.aircraft.airline.id).subscribe(
          (res : Response<Extra[]>) => {
            if(res.success)
              this.extras = new Map(this.extras).set(flight.id, res.data || []);
          }
        );
      });
    });

    this.ticketService.selectedSeats$.subscribe(seats => {
      if(seats)
        this.selectedSeats = seats;
    });

  }

  getExtrasByFlight(flight : Flight) : Extra[] {
    return this.extras.get(flight.id) || [];
  }

  onExtraChange(flight: Flight, extra : Extra, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedExtras.get(flight.id)?.push(extra);
  }


  confirmBooking() {
    this.journey.flights.forEach(flight => {

      const ticket : CreateTicket = {
        flightId: flight.id,
        finalCost: 0,
        seatNumber: this.selectedSeats.get(flight.id)?.number || '',
        extrasIds: this.selectedExtras.get(flight.id)?.map(extra => extra.id) || []
      }

      this.bookingService.buyTicket(ticket).subscribe({
        next: (res: Response<any>) => {
          if(res.success)
            console.log("Ticket bought successfully");
          },
        error: (err) => {
          console.log(err);
        }
      });
    });
    this.router.navigate(['/passengers']);
  }


}
