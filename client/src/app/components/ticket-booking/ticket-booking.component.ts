import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SearchFlightsService } from '../../services/search-flights.service';
import { PassengerService } from '../../services/passenger/passenger.service';
import { ClassesService } from '../../services/classes/classes.service';
import { ExtrasService } from '../../services/airlines/extras.service';
import { SeatsService } from '../../services/seats/seats.service';
import { FormsModule } from '@angular/forms';
import { Seat } from '../../../types/flights/flights';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { Router } from '@angular/router';

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

declare var bootstrap: any;

@Component({
  selector: 'app-ticket-booking',
  imports: [HeaderComponent, CommonModule, NgIf, FormsModule],
  templateUrl: './ticket-booking.component.html',
  styleUrl: './ticket-booking.component.css'
})
export class TicketBookingComponent {
  flightId: string | null = null;
  aircraftId: string | null = null;
  airlineId: string | null = null;
  
  seats: Seat[] = [];
  classes: any[] = [];
  extras: any[] = [];

  selectedSeat: Seat | null = null;
  selectedClass: string = '';
  selectedExtras: number[] = [];  // array di id scelti
  final_cost: number | null = null;


  flight: any;
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
    //carica informazioni volo
    this.selectedSeat = null;
    this.flightId = this.route.snapshot.paramMap.get('id')!;
    if (this.flightId) {
      this.searchFlightService.searchFlight(this.flightId).subscribe({
        next: (res) => {
          this.flight = res.flight;
          this.aircraftId = res.flight.aircraft.id;
          this.airlineId = res.flight.aircraft.airline.id;

          //devo farlo qui dento o mi trovo in errore -> esecuzione non sequenziale
          this.extrasService.getExtras(this.airlineId!).subscribe({
            next: (res: any) => {
              this.extras = res.extras;
            },
            error: (err) => console.error('Errore caricamento extras:', err)
          });
        },
        error: (err) => console.error('Errore caricamento volo:', err)

      });

      //carica informazioni della classi
      this.classesService.getClasses(this.flightId).subscribe({
        next: (res: any) => {
          this.classes = res.aircraft;
        },
        error: (err) => {
          console.error('Errore caricamento classi:', err);
      }})
    }

    this.seatService.get_seats(this.flightId!).subscribe({
      next: (res) => {
        this.seats = res.seats;
      },
      error: (err) => console.error('Errore caricamente seats', err)
    })

    //carica informazioni passeggeri
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

  get filteredSeats() {
    if (!this.selectedClass) return this.seats;
    return this.seats.filter(seat => seat.aircraft_class?.name === this.selectedClass);
  }

  onClassChange() {
    this.selectedSeat = null;
  }


  selectSeat(seat: Seat) {
    if (seat.state !== "AVAILABLE") return;

    if(!this.selectedSeat || this.selectedSeat.id !== seat.id)
      this.selectedSeat = seat;
    else
      this.selectedSeat = null;
  }


  calculateTotal(): number {
    if (!this.flight) return 0;

    const basePrice = this.flight.base_price || 0;

    // trova la classe selezionata
    const selectedClassObj = this.classes.find(c => c.name === this.selectedClass);
    const multiplier = selectedClassObj
      ? parseFloat(selectedClassObj.price_multiplier)
      : 1;

    // somma i prezzi di tutti gli extra selezionati
    const selectedExtrasObj = this.extras.filter(e => this.selectedExtras.includes(e.id));
    const extrasTotal = selectedExtrasObj.reduce((sum: number, extra: any) => {
      return sum + (parseFloat(extra.price) || 0);
    }, 0);

    this.final_cost = basePrice * multiplier + extrasTotal
    return basePrice * multiplier + extrasTotal;
  }

  onExtraChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = Number(checkbox.value);

    if (checkbox.checked) {
      // aggiunge l’extra selezionato
      this.selectedExtras.push(value);
    } else {
      // rimuove l’extra se deselezionato
      this.selectedExtras = this.selectedExtras.filter(id => id !== value);
    }
  }

  buyTicket() {
    const token = localStorage.getItem('access_token') || '';

    this.ticketService.buyTicket(Number(this.flightId), this.final_cost!, this.selectedSeat!.number, this.selectedExtras, token)
      .subscribe({
        next: () => this.showModal('successModal'),
        error: (err) => {
          console.error('Errore acquistando il biglietto', err);
          this.showModal('errorModal');
        }
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
