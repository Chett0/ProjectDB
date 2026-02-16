import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Extra } from '../../../../types/users/airlines';
import { CreateTicket, Flight, Journeys, SeatInfo } from '../../../../types/flights/flights';
import { Response } from '../../../../types/responses/responses';
import { TicketService } from '../../../services/ticket/ticket.service';
import { ExtraService } from '../../../services/airlines/extras.service';
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
    private extrasService: ExtraService,
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

  isExtraSelected(flight : Flight, extra : Extra) : boolean {
    return this.selectedExtras.get(flight.id)?.includes(extra) || false;
  }

  toggleExtra(flight: Flight, extra: Extra) {
  const list = this.selectedExtras.get(flight.id) ?? [];

  if (list.includes(extra))
    this.selectedExtras.set(flight.id, list.filter(e => e !== extra));
  else 
    this.selectedExtras.set(flight.id, [...list, extra]);
}


  confirmBooking() {
    this.journey.flights.forEach(flight => {
      const selectedSeat = this.selectedSeats.get(flight.id);
      const multiplier = selectedSeat && (selectedSeat as SeatInfo).class ? Number((selectedSeat as SeatInfo).class.priceMultiplier) : 1;
      const extrasList = this.selectedExtras.get(flight.id) || [];
      const extrasTotal = extrasList.reduce((sum, e) => sum + (Number((e as any).price) || 0), 0);
      const basePrice = Number(flight.basePrice) || 0;
      const finalCost = basePrice * multiplier + extrasTotal;

      const ticket : CreateTicket = {
        flightId: flight.id,
        finalCost: finalCost,
        seatNumber: selectedSeat?.number || '',
        extrasIds: extrasList.map(extra => extra.id) || []
      }

      this.bookingService.buyTicket(ticket).subscribe({
        next: (res: Response<any>) => {
          alert("Biglietto acquistato con successo!");
          this.router.navigate(['/passengers']);
        },
        error: (err) => {
          alert("Errore durante l'acquisto del biglietto. Riprova.");
          console.error('buyTicket error:', err);
        }
      });
    });
  }

  getFlightTotal(flight: Flight): number {
    const selectedSeat = this.selectedSeats?.get(flight.id);
    const multiplier = selectedSeat && (selectedSeat as SeatInfo).class ? Number((selectedSeat as SeatInfo).class.priceMultiplier) : 1;
    const extrasList = this.selectedExtras.get(flight.id) || [];
    const extrasTotal = extrasList.reduce((sum, e) => sum + (Number((e as any).price) || 0), 0);
    const basePrice = Number(flight.basePrice) || 0;
    return basePrice * multiplier + extrasTotal;
  }

  getTotal(): number {
    if (!this.journey || !this.journey.flights) return 0;
    return this.journey.flights.reduce((sum, flight) => sum + (Number(this.getFlightTotal(flight)) || 0), 0);
  }


}
