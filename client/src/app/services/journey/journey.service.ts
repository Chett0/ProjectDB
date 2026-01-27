import { Injectable } from '@angular/core';
import { Journeys } from '../../../types/flights/flights';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JourneyService {

  constructor() { }

  private journeySource = new BehaviorSubject<Journeys | null>(null);

  selectedJourney$ = this.journeySource.asObservable();

  setJourney(journey: Journeys) {
    this.journeySource.next(journey);
  }

  getJourney() {
    return this.journeySource.getValue();
  }

}
