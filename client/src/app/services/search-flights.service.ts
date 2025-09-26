import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<any[]>(`${this.apiUrl}/cities`);
  }

  searchFlights(
    from: string,
    to: string,
    departure_date: string,
    filters: any
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('departure_date', departure_date);

    
    params = params.set('min_price', 0)
                    .set('max_price', 10000);
    // if (filters.nonStop) {
    //   params = params.set('max_layovers', 0);
    // }
    // if (filters.oneStop) {
    //   params = params.set('max_layovers', 1);
    // }
    // if (filters.sort) {
    //   params = params.set('sort_by', filters.sort.sort_by);
    //   params = params.set('order', filters.sort.order);
    // }

    return this.http.get<any[]>(`${this.apiUrl}/flights`, { params });
  }

  searchFlight(id: string): Observable<any> {
    const parsedId: number = parseInt(id);
    return this.http.get<any[]>(`${this.apiUrl}/flights/${parsedId}`);
  }

  

}
