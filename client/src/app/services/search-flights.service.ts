import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchFlightsService {

  private apiUrl : string = 'http://localhost:5000/api'

  private http = inject(HttpClient)

  constructor() {}

  searchLocations(query : string) : Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations?query=${query}`)
  }  
  
   searchFlights(from: string, to: string, departure_date: string): Observable<any[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('departure_date', departure_date);

    return this.http.get<any[]>(`${this.apiUrl}/flights`, { params });
  }
}
