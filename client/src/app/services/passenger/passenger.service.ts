import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments/enviroments';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {

  constructor(private http: HttpClient) { }

  getPassengerInfo(): Observable<any> {
    const token = localStorage.getItem('access_token');

    return this.http.get<any>(`${enviroment.apiUrl}/passengers/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
