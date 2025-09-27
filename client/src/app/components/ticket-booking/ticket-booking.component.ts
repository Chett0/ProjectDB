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
import { Seat } from '../../../types/flights/flights';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

export interface PassengerInfo {
  id: number;
  name: string;
  surname: string;
}

export interface TicketData {
  flight_id: number;
  final_cost: number;
  seat_number: string;
  extras: number[];
}

export interface FlightData {
  flight: any;
  seats: Seat[];
  classes: any[];
  airlineId: string;
  extras: any[];
  selectedSeat: Seat | null;
  selectedClass: string;
  selectedExtras: number[];
  final_cost: number | null;
}


declare var bootstrap: any;

@Component({
  selector: 'app-ticket-booking',
  imports: [HeaderComponent, CommonModule, NgIf, FormsModule, FooterComponent],
  templateUrl: './ticket-booking.component.html',
  styleUrl: './ticket-booking.component.css'
})
export class TicketBookingComponent {
  //array in cui ogni campo contieni le informazione del biglietto
  flights: { [key: string]: FlightData } = {};
  flightIds: string[] = [];
  passenger: PassengerInfo | null = null;
  ticketColors: Record<string, string> = {
    'Economy': 'lightblue',
    'Business': 'gold',
    'First Class': 'purple',
    'Premium': 'red'
  };

  constructor(
    private route: ActivatedRoute,
    private searchFlightService: SearchFlightsService,
    private passengerService: PassengerService,
    private classesService: ClassesService,
    private extrasService: ExtrasService,
    private seatService: SeatsService,
    private ticketService: TicketBookingService,
    private router: Router
  ) { }

  // allora come prima cosa in sta funzione prendo tutti i dati che mi servono
  // manca la lista di cassi disponibili per ciascun volo -> le prendo dal id volo
  //lista di extra disponibili per il viaggio -> le prendo dalla compagnia aerea
  //lista di posti disponibili per essere prenotati nel volo -> lo prendo grazie all'id del volo + classe scelta


  ngOnInit(): void {
    this.flightIds = this.route.snapshot.queryParamMap.getAll('ids');
    this.flightIds.forEach(flightId => {
      this.flights[flightId] = {
        flight: null,
        seats: [],
        classes: [],
        airlineId: '',
        extras: [],
        selectedSeat: null,
        selectedClass: '',
        selectedExtras: [],
        final_cost: null
      };

      // Carica il volo
      this.searchFlightService.searchFlight(flightId).subscribe(res => {
        this.flights[flightId].flight = res.flight;
        const airlineId = res.flight.aircraft.airline.id;

        // Carica extras
        this.extrasService.getExtras(airlineId).subscribe((res: any) => {
          this.flights[flightId].extras = res.extras;
        });

        // Carica classi
        this.classesService.getClasses(airlineId).subscribe((res: any) => {
          this.flights[flightId].classes = res.classes;
        });

        // Carica seats
        this.seatService.get_seats(flightId).subscribe((res: any) => {
          this.flights[flightId].seats = res.seats;
        });
      });

      console.log(this.flights[flightId])

    });



    this.passengerService.getPassengerInfo().subscribe({
      next: (data: any) => {
        this.passenger = {
          id: data.passenger.id,
          name: data.passenger.name,
          surname: data.passenger.surname
        }
      },
      error: (err) => console.error(err)
    })
  }



  getFilteredSeats(flightId: string) {
    const flightData = this.flights[flightId].seats;
    // if (!flightData.selectedClass) return flightData.seats;
    // return flightData.seats.filter(seat => seat.aircraft_class?.name === flightData.selectedClass);
    return flightData;
  }

  onClassChange(flightId: string) {
    this.flights[flightId].selectedSeat = null;
  }


  selectSeat(flightId: string, seat: Seat) {
    if (seat.state !== "AVAILABLE") return;

    const flightData = this.flights[flightId];
    if (!flightData.selectedSeat || flightData.selectedSeat.id !== seat.id) {
      flightData.selectedSeat = seat;
    } else {
      flightData.selectedSeat = null;
    }
  }



  calculateTotal(flightId: string): number {
    const flightData = this.flights[flightId];
    if (!flightData.flight) return 0;

    const basePrice = Number(flightData.flight.base_price) || 0;
    const selectedClassObj = flightData.classes.find(c => c.name === flightData.selectedClass);
    const multiplier = selectedClassObj ? Number(selectedClassObj.price_multiplier) : 1;

    const extrasTotal = flightData.extras
      .filter(e => flightData.selectedExtras.includes(e.id))
      .reduce((sum: number, extra: any) => sum + (Number(extra.price) || 0), 0);

    flightData.final_cost = basePrice * multiplier + extrasTotal;
    return flightData.final_cost;
  }

  onExtraChange(flightId: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = Number(checkbox.value);
    const flightData = this.flights[flightId];

    if (checkbox.checked) {
      flightData.selectedExtras.push(value);
    } else {
      flightData.selectedExtras = flightData.selectedExtras.filter(id => id !== value);
    }
  }


  buyTickets() {
    const tickets = this.flightIds.map(fid => {
      const flightId = Number(fid);
      const f = this.flights[flightId];
      return {
        flightId: flightId,
        finalCost: this.calculateTotal(fid),
        seatNumber: f.selectedSeat!.number,
        extras: f.selectedExtras
      };
    });

    this.ticketService.buyTickets(tickets).subscribe({
      next: () => this.showModal('successModal'),
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
      modal.hide(); // chiudi il modale
    }
    this.router.navigate(['/passengers']);
  }

}
