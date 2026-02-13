import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SearchFlightsService } from '../../../services/search-flights/search-flights.service';
import { PassengerService } from '../../../services/passenger/passenger.service';
import { ClassesService } from '../../../services/classes/classes.service';
import { ExtrasService } from '../../../services/airlines/extras.service';
import { SeatsService } from '../../../services/seats/seats.service';
import { FormsModule } from '@angular/forms';
import { Flight, Journeys, Seat, SeatInfo } from '../../../../types/flights/flights';
import { TicketBookingService } from '../../../services/ticket-booking/ticket-booking.service';
import { Router } from '@angular/router';
import { Response } from '../../../../types/responses/responses';
import { PassengerInfo } from '../../../../types/users/passenger';
import { Class, Extra } from '../../../../types/users/airlines';
import { TicketService } from '../../../services/ticket/ticket.service';

declare var bootstrap: any;

@Component({
  selector: 'app-ticket-booking',
  imports: [HeaderComponent, CommonModule, NgIf, FormsModule],
  templateUrl: './ticket-booking.component.html',
  styleUrl: './ticket-booking.component.css'
})
export class TicketBookingComponent {

  journey! : Journeys;
  passenger! : PassengerInfo;
  flightTickets: { [key: number]: any } = {};
  flightIds: number[] = [];
  ticketColors: Record<string, string> = {
    'Economy': 'lightblue',
    'Business': 'gold',
    'First Class': 'purple',
    'Premium': 'red'
  };

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private passengerService: PassengerService,
    private classesService: ClassesService,
    private extrasService: ExtrasService,
    private seatService: SeatsService,
    private ticketBookingService: TicketBookingService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.ticketService.journeys$.subscribe(journey => {
      if(!journey) {
        this.router.navigate(['/']);
        return;
      }

      this.journey = journey;
      this.flightIds = journey.flights.map(f => f.id);

      journey.flights.forEach(flight => {
        const fid = flight.id;
        this.flightTickets[fid] = {
          flight: flight,
          seats: [] as SeatInfo[],
          classes: [] as Class[],
          extras: [] as Extra[],
          selectedSeat: null,
          selectedClass: '',
          selectedExtras: [] as number[],
          final_cost: 0
        };

        // load extras/classes/seats asynchronously
        this.extrasService.getExtras(flight.aircraft.airline.id).subscribe((res: Response<Extra[]>) => {
          if (res.success) this.flightTickets[fid].extras = res.data || [];
        });
        this.classesService.getClasses(flight.aircraft.id).subscribe((res: Response<Class[]>) => {
          if (res.success) this.flightTickets[fid].classes = res.data || [];
        });
        this.seatService.getSeats(flight.id).subscribe((res: Response<SeatInfo[]>) => {
          if (res.success) this.flightTickets[fid].seats = res.data || [];
        });
      });
    });

    this.passengerService.getPassengerInfo().subscribe({
      next: (res : Response<PassengerInfo>) => {
        if(res.success && res.data)
          this.passenger = res.data;
        else{
          this.router.navigate(['/login']);
          return;
        }
      },
      error: (err) => {
        console.log(err);
      }
    })

    // this.flights.forEach(flight => {
    //   let extra : Extra[] = [];
    //   let classes : Class[] = [];
    //   let seats : SeatInfo[] = [];

    //   this.extrasService.getExtras(flight.aircraft.airline.id).subscribe(
    //     (res : Response<Extra[]>) => {
    //       if(res.success)
    //         extra = res.data || [];
    //     }
    //   );

    //   this.classesService.getClasses(flight.aircraft.id).subscribe(
    //     (res : Response<Class[]>) => {
    //       if(res.success)
    //         classes = res.data || [];
    //     }
    //   );

    //   this.seatService.getSeats(flight.id).subscribe(
    //     (res : Response<SeatInfo[]>) => {
    //       if(res.success)
    //         seats = res.data || [];
    //     }
    //   );

    //   this.flightTickets.push({
    //     flight: flight,
    //     seats: seats,
    //     classes: classes,
    //     extras: extra,
    //     selectedSeat: null,
    //     selectedClass: '',
    //     selectedExtras: [],
    //     final_cost: 0
    //   })

    //   this.flightIds.push(flight.id);

    // });
    
    
  }

  get hasMultipleFlights(): boolean {
    return !!(this.journey && this.journey.flights && this.journey.flights.length > 1);
  }
  getFilteredSeats(flightId: number): SeatInfo[] {
    return this.flightTickets[flightId]?.seats || [];
  }

  onClassChange(flightId: number) {
    if (this.flightTickets[flightId]) {
      this.flightTickets[flightId].selectedSeat = null;
    }
  }

  selectSeat(flightId: number, seat: SeatInfo) {
    if (!seat || (seat as any).state === "UNAVAILABLE" || (seat as any).state === "RESERVED") return;

    const flightData = this.flightTickets[flightId];
    if (!flightData) return;

    if (!flightData.selectedSeat || flightData.selectedSeat.id !== seat.id) {
      flightData.selectedSeat = seat;
    } else {
      flightData.selectedSeat = null;
    }
  }

  getTotal(): number {
    let total = 0;
    this.journey.flights.forEach(flight => {
      total += flight.basePrice;
    });
    return total;
  }

  confirmPurchase() {
    this.router.navigate(['/seats']);
  }


  calculateTotal(flightId: number): number {
    const flightData = this.flightTickets[flightId];
    if (!flightData || !flightData.flight) return 0;

    const basePrice = Number(flightData.flight.basePrice) || 0;
    const multiplier = flightData.selectedSeat && (flightData.selectedSeat as any).aircraftClass ? Number((flightData.selectedSeat as any).aircraftClass.priceMultiplier) : 1;

    const extrasTotal = (flightData.extras || [])
      .filter((e: any) => (flightData.selectedExtras || []).includes(e.id))
      .reduce((sum: number, extra: any) => sum + (Number(extra.price) || 0), 0);

    flightData.final_cost = basePrice * multiplier + extrasTotal;
    return flightData.final_cost;
  }

  onExtraChange(flightId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = Number(checkbox.value);
    const flightData = this.flightTickets[flightId];
    if (!flightData) return;

    if (checkbox.checked) {
      if (!flightData.selectedExtras) flightData.selectedExtras = [];
      flightData.selectedExtras.push(value);
    } else {
      flightData.selectedExtras = (flightData.selectedExtras || []).filter((id: number) => id !== value);
    }
  }

  buyTickets() {
    const tickets = this.flightIds.map(fid => {
      const f = this.flightTickets[fid];
      return {
        flightId: f.flight.id,
        finalCost: this.calculateTotal(fid),
        seatNumber: f.selectedSeat ? f.selectedSeat.number : '',
        extras: f.selectedExtras || []
      };
    });

    this.ticketBookingService.buyTickets(tickets).subscribe({
      next: (res: any) => {
        const ok = res && (res.success === undefined || res.success === true);
        this.showModal(ok ? 'successModal' : 'errorModal');
      },
      error: () => this.showModal('errorModal')
    });
  }

  showModal(modalId: string) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  successRedirect() {
    const modalEl = document.getElementById('successModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
    this.router.navigate(['/passengers']);
  }

}
