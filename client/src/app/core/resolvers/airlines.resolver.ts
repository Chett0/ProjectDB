import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { RoutesService } from '../../services/airlines/routes.service';
import { AircraftsService } from '../../services/airlines/aircrafts.service';
import { Observable, forkJoin, of, tap } from 'rxjs';
import { AirlineResolverResponse } from '../../../types/users/airlines';

@Injectable({ providedIn: 'root' })
export class AirlinesResolver implements Resolve<any> {
  constructor(
    private airlinesService: AirlinesService,
    private routesService: RoutesService,
    private aircraftsService: AircraftsService,
  ) {}

  resolve(): Observable<any> {
    return forkJoin({
      // info: this.airlinesService.getAirlinesInfo().pipe(catchError(() => of(null))),
      // flights: this.airlinesService.getAirlinesFlights().pipe(catchError(() => of({ flights: [] }))),
      // routes: this.routesService.getRoutes().pipe(catchError(() => of({ routes: [] }))),
      // aircrafts: this.aircraftsService.getAircrafts().pipe(catchError(() => of([]))),
      // extras: this.airlinesService.getExtras().pipe(catchError(() => of({ extras: [] }))),
      dashboardStatsResponse: this.airlinesService.getDashboardStats().pipe(tap(
        data => console.log('Dashboard Stats Data:', data)
      ))
    });
  }
}
