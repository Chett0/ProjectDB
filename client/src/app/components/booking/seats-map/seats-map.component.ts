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
import { forkJoin } from 'rxjs';

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

  ticketColors: Record<string, string> = {
    'Economy': 'lightblue',
    'Business': 'gold',
    'First Class': 'purple',
    'Premium': 'red'
  };

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

    this.ticketService.setSelectedSeats(this.seatsSelected);
    this.router.navigate(['/booking/extras']);
  }

}
