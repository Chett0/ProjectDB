import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { Class } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class ClassesService {

  constructor(private http: HttpClient) {}

  getClasses(airlineId : number, aircraftId: number): Observable<Response<Class[]>> {
    return this.http.get<Response<Class[]>>(`${enviroment.apiUrl}/airlines/${airlineId}/aircrafts/${aircraftId}/classes`);
  }
}
