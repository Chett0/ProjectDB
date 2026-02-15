import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { RoutesService } from '../../services/airlines/routes.service';
import { AircraftsService } from '../../services/airlines/aircrafts.service';
import { ExtrasService } from '../../services/airlines/extras.service';
import { Observable, forkJoin, of, tap } from 'rxjs';
import { AirlineResolverResponse } from '../../../types/users/airlines';

@Injectable({ providedIn: 'root' })
export class AirlinesResolver implements Resolve<AirlineResolverResponse> {
  constructor(
    private airlinesService: AirlinesService,
    private routesService: RoutesService,
    private aircraftsService: AircraftsService,
    private extrasService: ExtrasService,
  ) {}

  resolve(): Observable<AirlineResolverResponse> {
    return forkJoin({
      dashboardStatsResponse: this.airlinesService.getDashboardStats().pipe(),
      routesResponse: this.routesService.getRoutes().pipe(),
      aircraftsResponse: this.aircraftsService.getAircrafts().pipe(),
      flightsResponse: this.airlinesService.getAirlinesFlights(1, 6).pipe(),
      extrasResponse: this.extrasService.getExtras().pipe()
    });
  }
}
