import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ClassesService {

  constructor(private http: HttpClient) {}

  getClasses(aircraftId: string): Observable<string[]> {
    return this.http.get<string[]>(`${enviroment.apiUrl}/aircrafts/${aircraftId}/classes`);
  }
}
