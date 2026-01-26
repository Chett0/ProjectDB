import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminResolverResponse } from '../../../types/users/admin';

@Injectable({ providedIn: 'root' })
export class AdminResolver implements Resolve<AdminResolverResponse> {
  constructor(
    private airlinesService: AirlinesService
  ) {}

  resolve(): Observable<AdminResolverResponse> {
    return forkJoin({
      airlinesResponse: this.airlinesService.getAllAirlines().pipe(),
      dashboardResponse : this.airlinesService.getAdminDashboardStats().pipe()
    });
  }
}
