import { Injectable } from '@angular/core';
import { Response } from '../../../types/responses/responses';
import { AdminDashboard } from '../../../types/users/admin';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http : HttpClient) { }

    getAdminDashboardStats() {
    return this.http.get<Response<AdminDashboard>>(`${enviroment.apiUrl}/v1/admin/dashboard_stats`);
  }

}
