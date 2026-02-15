import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { Observable, forkJoin, of } from 'rxjs';
import { AdminResolverResponse } from '../../../types/users/admin';
import { AdminService } from '../../services/admin/admin.service';

@Injectable({ providedIn: 'root' })
export class AdminResolver implements Resolve<AdminResolverResponse> {
  constructor(
    private airlinesService: AirlinesService,
    private adminService: AdminService
  ) {}

  resolve(): Observable<AdminResolverResponse> {
    return forkJoin({
      airlinesResponse: this.airlinesService.getAllAirlines().pipe(),
      dashbboardStatsResponse: this.adminService.getAdminDashboardStats().pipe()
    });
  }
}
