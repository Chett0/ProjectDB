import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { Extra } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {

  constructor(private http: HttpClient) {}

  getExtras(airlineId : number): Observable<Response<Extra[]>> {
    return this.http.get<Response<Extra[]>>(`${enviroment.apiUrl}/airlines/${airlineId}/extras`);
  }
}
