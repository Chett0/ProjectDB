import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../services/airlines/airlines.service';
import { RoutesService } from '../services/airlines/routes.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminResolver implements Resolve<any> {
  constructor(
    private airlinesService: AirlinesService,
    private routesService: RoutesService
  ) {}

  resolve(): Observable<any> {
    return forkJoin({
      airlines: this.airlinesService.getAllAirlines().pipe(catchError(() => of({ airlines: [] }))),
      airlinesCount: this.airlinesService.getAirlinesCount().pipe(catchError(() => of({ count: 0 }))),
      flightsCount: this.airlinesService.getFlightsCountAll().pipe(catchError(() => of({ count: 0 }))),
      routesCount: this.routesService.getRoutesCountAll().pipe(catchError(() => of({ count: 0 }))),
      passengersCount: this.airlinesService.getPassengersCount().pipe(catchError(() => of({ count: 0 })))
    });
  }
}
