import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { RoutesService } from '../../services/airlines/routes.service';
import { AircraftsService } from '../../services/airlines/aircrafts.service';
import { ExtrasService } from '../../services/airlines/extras.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AirlinesResolver implements Resolve<any> {
  constructor(
    private airlinesService: AirlinesService,
    private routesService: RoutesService,
    private aircraftsService: AircraftsService,
    private extrasService: ExtrasService
  ) {}

  resolve(): Observable<any> {
    return forkJoin({
      info: this.airlinesService.getAirlinesInfo().pipe(catchError(() => of(null))),
      flights: this.airlinesService.getAirlinesFlights().pipe(catchError(() => of({ flights: [] }))),
      flightsCount: this.airlinesService.getAirlineFlightsCount().pipe(catchError(() => of({ count: 0 }))),
      routes: this.routesService.getRoutes().pipe(catchError(() => of({ routes: [] }))),
      routesCount: this.routesService.getRoutesCount().pipe(catchError(() => of({ count: 0 }))),
      aircrafts: this.aircraftsService.getAircrafts().pipe(catchError(() => of([]))),
      aircraftsCount: this.aircraftsService.getAircraftsCount().pipe(catchError(() => of({ count: 0 }))),
      extras: this.airlinesService.getExtras().pipe(catchError(() => of({ extras: [] }))),
      passengersCount: this.airlinesService.getPassengersCountAll().pipe(catchError(() => of({ count: 0 })))
    });
  }
}
