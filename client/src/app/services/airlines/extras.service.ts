import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { CreateExtra, Extra } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class ExtraService {

  private extrasCache: Extra[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minuti

  constructor(private http: HttpClient) {}

  getExtras(airlineId : number): Observable<Response<Extra[]>> {
    return this.http.get<Response<Extra[]>>(`${enviroment.apiUrl}/v1/airlines/${airlineId}/extras`);
  }

  createExtra(extra: CreateExtra) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.post<Response<Extra>>(`${enviroment.apiUrl}/v1/airline/extras`, extra);
  }

  getAirlineExtras(forceRefresh = false): Observable<Response<Extra[]>> {
    const now = Date.now();
    if (!forceRefresh && this.extrasCache && this.extrasCacheTimestamp && (now - this.extrasCacheTimestamp < this.cacheTTL)) {
      return of({ 
        success: true,
        message: 'Extras retrieved successfully (cache)', 
        data: this.extrasCache 
      });
    }
    return this.http.get<Response<Extra[]>>(`${enviroment.apiUrl}/v1/airline/extras`).pipe(
      tap((res : Response<Extra[]>) => {
        if (res && res.data) {
          this.extrasCache = res.data;
          this.extrasCacheTimestamp = Date.now();
        }
      })
    );
  }

  deleteExtra(extraId: number) {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/v1/airline/extras/${extraId}`);
  }

  
  clearExtrasCache() {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
  }
}
