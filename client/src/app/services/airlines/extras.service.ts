import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {

  constructor(private http: HttpClient) {}

  getExtras(airlineId: string): Observable<string[]> {
    return this.http.get<string[]>(`${enviroment.apiUrl}/airline/extras`, {
      params: { airline_id : airlineId }
    });
  }
}
