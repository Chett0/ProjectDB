import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SearchFlightsService } from '../../services/search-flights/search-flights.service';
import { PassengerService } from '../../services/passenger/passenger.service';
import { ClassesService } from '../../services/classes/classes.service';
import { ExtrasService } from '../../services/airlines/extras.service';
import { SeatsService } from '../../services/seats/seats.service';
import { FormsModule } from '@angular/forms';
import { Flight, Journeys, Seat, SeatInfo, TicketFlightData } from '../../../types/flights/flights';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { Response } from '../../../types/responses/responses';
import { JourneyService } from '../../services/journey/journey.service';
import { PassengerInfo } from '../../../types/users/passenger';
import { Class, Extra } from '../../../types/users/airlines';

declare var bootstrap: any;

@Component({
  selector: 'app-ticket-booking',
  imports: [HeaderComponent, CommonModule, NgIf, FormsModule, FooterComponent],
  templateUrl: './ticket-booking.component.html',
  styleUrl: './ticket-booking.component.css'
})
export class TicketBookingComponent {

  flightTickets: TicketFlightData[] = [];
  flights : Flight[] = [];
  flightIds: number[] = [];
  passenger: PassengerInfo | null = null;
  ticketColors: Record<string, string> = {
    'Economy': 'lightblue',
    'Business': 'gold',
    'First Class': 'purple',
    'Premium': 'red'
  };

  currentJourney : Journeys | null = null;

  constructor(
    private route: ActivatedRoute,
    private journeyService: JourneyService,
    private passengerService: PassengerService,
    private classesService: ClassesService,
    private extrasService: ExtrasService,
    private seatService: SeatsService,
    private ticketService: TicketBookingService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.journeyService.selectedJourney$.subscribe(journey => {
      this.currentJourney = journey;
      if(!this.currentJourney)
        this.router.navigate(['/']);
      else{
        this.flights.push(this.currentJourney.flights[0]);
        if(this.currentJourney.flights.length > 1)
          this.flights.push(this.currentJourney.flights[1]);
      }
    });

    this.flights.forEach(flight => {
      let extra : Extra[] = [];
      let classes : Class[] = [];
      let seats : SeatInfo[] = [];

      this.extrasService.getExtras(flight.aircraft.airline.id).subscribe(
        (res : Response<Extra[]>) => {
          if(res.success)
            extra = res.data || [];
        }
      );

      this.classesService.getClasses(flight.aircraft.id).subscribe(
        (res : Response<Class[]>) => {
          if(res.success)
            classes = res.data || [];
        }
      );

      this.seatService.getSeats(flight.id).subscribe(
        (res : Response<SeatInfo[]>) => {
          if(res.success)
            seats = res.data || [];
        }
      );

      this.flightTickets.push({
        flight: flight,
        seats: seats,
        classes: classes,
        extras: extra,
        selectedSeat: null,
        selectedClass: '',
        selectedExtras: [],
        final_cost: 0
      })

      this.flightIds.push(flight.id);

    });
    
    this.passengerService.getPassengerInfo().subscribe({
      next: (res : Response<PassengerInfo>) => {
        if(res.success)
          this.passenger = res.data || null;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }



  getFilteredSeats(flightId: number) {
    const flightData : SeatInfo[] = this.flightTickets[flightId].seats;
    return flightData;
  }

  onClassChange(flightId: number) {
    this.flightTickets[flightId].selectedSeat = null;
  }


  selectSeat(flightId: number, seat: SeatInfo) {
    if (seat.state !== "AVAILABLE") return;

    const flightData = this.flightTickets[flightId];
    if (!flightData.selectedSeat || flightData.selectedSeat.id !== seat.id) {
      flightData.selectedSeat = seat;
    } else {
      flightData.selectedSeat = null;
    }
  }



  calculateTotal(flightId: number): number {
    const flightData = this.flightTickets[flightId];
    if (!flightData.flight) return 0;

    const basePrice = Number(flightData.flight.basePrice) || 0;
    const multiplier = this.flightTickets[flightId].selectedSeat ? Number(this.flightTickets[flightId].selectedSeat.aircraftClass.priceMultiplier) : 1;

    const extrasTotal = flightData.extras
      .filter(e => flightData.selectedExtras.includes(e.id))
      .reduce((sum: number, extra: any) => sum + (Number(extra.price) || 0), 0);

    flightData.final_cost = basePrice * multiplier + extrasTotal;
    return flightData.final_cost;
  }

  onExtraChange(flightId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = Number(checkbox.value);
    const flightData = this.flightTickets[flightId];

    if (checkbox.checked) {
      flightData.selectedExtras.push(value);
    } else {
      flightData.selectedExtras = flightData.selectedExtras.filter(id => id !== value);
    }
  }


  buyTickets() {

    this.flightTickets.forEach(flight => {

      let ticket = {
        flightId: flight.flight.id,
        finalCost: this.calculateTotal(flight.flight.id),
        seatNumber: flight.selectedSeat!.number,
        extrasIds: flight.selectedExtras
      }

      this.ticketService.buyTicket(ticket).subscribe({
        next: (res: Response<any>) => {
          if(res.success)
            this.showModal('successModal')
          else
            this.showModal('errorModal')
        },
        error: () => this.showModal('errorModal')
    });
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
      modal.hide(); // chiudi il modale
    }
    this.router.navigate(['/passengers']);
  }

}
