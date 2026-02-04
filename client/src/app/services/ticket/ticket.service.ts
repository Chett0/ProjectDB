import { Injectable } from '@angular/core';
import { Flight, Journeys, SeatInfo } from '../../../types/flights/flights';
import { BehaviorSubject } from 'rxjs';
import { tick } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor() { }

  private journeys = new BehaviorSubject<Journeys | null>(null);
  private selectedSeats = new BehaviorSubject<Map<number, SeatInfo> | null>(null);
  
    journeys$ = this.journeys.asObservable();
    selectedSeats$ = this.selectedSeats.asObservable();
  
  setJourneys(journeys: Journeys) {
    this.journeys.next(journeys);
  }

  getJourneys(): Journeys | null {
    return this.journeys.getValue();
  }

  setSelectedSeats(selectedSeats: Map<number, SeatInfo> | null) {
    this.selectedSeats.next(selectedSeats);
  }

}
