import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { filter, Observable } from 'rxjs';
import { Filters } from '../../components/flights/filters-flights/filters-flights.component';

@Injectable({
  providedIn: 'root',
})
export class SearchFlightsService {
  private apiUrl: string = 'http://localhost:5000/api';

  private http = inject(HttpClient);

  constructor() {}

  searchLocations(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cities?query=${query}`);
  }

  getCities() : Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/airports/cities`);
  }

  searchFlights(
    from: string,
    to: string,
    departure_date: string,
    filters: Filters
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('departure_date', departure_date);

    
    params = params.set('max_price', filters.maxPrice);
    params = params.set('max_layovers', filters.nStop);
    
    if(filters.sortBy && filters.order){
      params = params.set('sort_by', filters.sortBy);
      params = params.set('order', filters.order);
    }

    return this.http.get<any[]>(`${this.apiUrl}/flights`, { params });
  }

  searchFlight(id: string): Observable<any> {
    const parsedId: number = parseInt(id);
    return this.http.get<any[]>(`${this.apiUrl}/flights/${parsedId}`);
  }

  

}
