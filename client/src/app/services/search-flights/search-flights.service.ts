import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { filter, Observable } from 'rxjs';
import { Filters, Journeys } from '../../../types/flights/flights';
import { Response } from '../../../types/responses/responses';
import { City } from '../../../types/airports/airports';
import { enviroment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root',
})
export class SearchFlightsService {

  private http = inject(HttpClient);

  constructor() {}

  getCities() : Observable<Response<City[]>> {
    return this.http.get<Response<City[]>>(`${enviroment.apiUrl}/v1/cities`);
  }

  searchFlights(
    from: string,
    to: string,
    departure_date: string,
    filters: Filters
  , page: number = 1, limit: number = 10
  ): Observable<Response<{ journeys: Journeys[]; total: number; page: number; limit: number }>> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('departure_date', departure_date);

    params = params.set('max_price', filters.maxPrice);
    params = params.set('n_stops', filters.nStops);
    params = params.set('page', String(page));
    params = params.set('limit', String(limit));
    
    if(filters.sortBy && filters.order){
      params = params.set('sort_by', filters.sortBy);
      params = params.set('order', filters.order);
    }

    return this.http.get<Response<{ journeys: Journeys[]; total: number; page: number; limit: number }>>(`${enviroment.apiUrl}/v1/flights`, { params });
  }

}
