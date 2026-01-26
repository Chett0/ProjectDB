import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { RoutesService } from '../../services/airlines/routes.service';
import { AircraftsService } from '../../services/airlines/aircrafts.service';
import { Observable, forkJoin, of, tap } from 'rxjs';
import { AirlineResolverResponse } from '../../../types/users/airlines';

@Injectable({ providedIn: 'root' })
export class AirlinesResolver implements Resolve<AirlineResolverResponse> {
  constructor(
    private airlinesService: AirlinesService,
    private routesService: RoutesService,
    private aircraftsService: AircraftsService,
  ) {}

  resolve(): Observable<AirlineResolverResponse> {
    return forkJoin({
      // info: this.airlinesService.getAirlinesInfo().pipe(catchError(() => of(null))),
      dashboardStatsResponse: this.airlinesService.getDashboardStats().pipe()
    });
  }
}
