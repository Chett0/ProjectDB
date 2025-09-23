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

export interface PassengerInfo {
  id: number;
  name: string;
  surname: string;
}

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
  selectedExtra: string = '';


  flight: any;
  passenger: PassengerInfo | null = null;


  constructor(
    private route: ActivatedRoute,
    private searchFlightService: SearchFlightsService,
    private passengerService: PassengerService,
    private classesService: ClassesService,
    private extrasService: ExtrasService,
    private seatService: SeatsService
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

    // this.seatService.get_free_seats(this.flightId!).subscribe({
    //   next: (res) => {
    //     this.seats = res;
    //   },
    //   error: (err) => console.error('Errore caricamente seats', err)
    // })


    this.seatService.get_seats(this.flightId!).subscribe({
      next: (res) => {
        this.seats = res;
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

  //select con i valori dinamici 

  get filteredSeats() {
    if (!this.selectedClass) return this.seats;
    return this.seats.filter(seat => seat.aircraft_class?.name === this.selectedClass);
  }

  onClassChange() {
    this.selectedSeat = null;
  }


  selectSeat(seat: Seat) {
    if (seat.state !== "Available") return;

    if(!this.selectedSeat || this.selectedSeat.id !== seat.id)
      this.selectedSeat = seat;
    else
      this.selectedSeat = null;
  }

}
