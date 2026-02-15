import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../../services/ticket/ticket.service';
import { Flight, Journeys, SeatInfo, SeatState } from '../../../../types/flights/flights';
import { Response } from '../../../../types/responses/responses';
import { SeatsService } from '../../../services/seats/seats.service';
import { Class } from '../../../../types/users/airlines';
import { ClassesService } from '../../../services/classes/classes.service';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-seats-map',
  imports: [HeaderComponent, CommonModule],
  templateUrl: './seats-map.component.html',
  styleUrl: './seats-map.component.css'
})
export class SeatsMapComponent implements OnInit {

  seatsSelected = new Map<number, SeatInfo>();
  journey! : Journeys;
  seatsMap: Map<number, SeatInfo[]> = new Map();
  classes: Map<number, Class[]> = new Map();

  SeatState = SeatState;


  seatColor(seat: SeatInfo): string {
    const cname = (seat.class && (seat.class as Class).name) ? String((seat.class as Class).name).toLowerCase() : '';
    if (cname.includes('first')) return '#D4AF37'; // gold
    if (cname.includes('business')) return '#C0C0C0'; // silver
    if (cname.includes('econom')) return '#CD7F32'; // bronze
    if (cname.includes('premium')) return '#ff6b6b';
    return 'steelblue';
  }

  constructor(
    private seatService: SeatsService,
    private classService: ClassesService,
    private ticketService: TicketService,
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
        forkJoin({
          responseSeats: this.seatService.getSeats(flight.id),
          responseClasses: this.classService.getClasses(flight.aircraft.id)
        }).subscribe(({ responseSeats, responseClasses }) => {

          if (responseSeats.success && responseSeats.data) {
            this.seatsMap = new Map(this.seatsMap).set(flight.id, responseSeats.data);
          }

          if (responseClasses.success && responseClasses.data) {
            this.classes = new Map(this.classes).set(flight.id, responseClasses.data);
          }

        });
      });
    });

}

  getFilteredSeats(flight: Flight) : SeatInfo[] {
    const seats : SeatInfo[] = this.seatsMap.get(flight.id) || [];
    return seats;
  }

  selectSeat(flight: Flight, seat: SeatInfo) {
    if (seat.state !== SeatState.AVAILABLE) return;
    this.seatsSelected.set(flight.id, seat);
  }


  confirmSeats() {
    if(this.seatsSelected.size !== this.journey.flights.length) 
      return;

    const seatRequests = Array.from(this.seatsSelected.entries()).map(
        ([flightId, seat]) =>
          this.seatService.createSeatSession(seat.id).pipe(
            map(response => ({ seat, flightId, response })),
            catchError(err => of({ seat, flightId, response: { success: false }, error: err }))
          )
      );

      forkJoin(seatRequests).subscribe(results => {
        const failed = results.filter(r => !r.response.success);

        if (failed.length > 0) {
          failed.forEach(f => {
            alert(`Failed to create session for seat ${f.seat.number} on flight ${f.flightId}`);
          });
        } else {
          this.ticketService.setSelectedSeats(this.seatsSelected);
          this.router.navigate(['/booking/extras']);
        }
      });

    // this.seatsSelected.forEach((seat, flightId) => {
    //   this.seatService.createSeatSession(seat.id).subscribe({
    //     next: (response) => {
    //       if (!response.success) {
    //         alert(`Failed to create session for seat ${seat.number} on flight ${flightId}`);
    //       } else {
    //         this.ticketService.setSelectedSeats(this.seatsSelected);
    //         this.router.navigate(['/booking/extras']);
    //       }
    //     },
    //     error: (err) => {
    //       alert(`Failed to create session for seat ${seat.number} on flight ${flightId}`);
    //     }
    //   });
    // });    
  }

}
