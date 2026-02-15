import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { enviroment } from '../../enviroments/enviroments';
import { Extra, CreateExtra } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {
  private extrasCache: Extra[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minutes

  constructor(private http: HttpClient) {}

  createExtra(extra: CreateExtra): Observable<Response<Extra>> {
    this.clearExtrasCache();
    return this.http.post<Response<Extra>>(`${enviroment.apiUrl}/airlines/extras`, extra).pipe(
      tap((res: Response<Extra>) => {
        if (res && res.data) {
          if (!this.extrasCache) this.extrasCache = [];
          this.extrasCache.push(res.data);
          this.extrasCacheTimestamp = Date.now();
        }
      })
    );
  }

  getExtras(airlineId?: number, forceRefresh = false): Observable<Response<Extra[]>> {
    const now = Date.now();
    if (!forceRefresh && this.extrasCache && this.extrasCacheTimestamp && (now - this.extrasCacheTimestamp < this.cacheTTL)) {
      return of({
        success: true,
        message: 'Extras retrieved successfully (cache)',
        data: this.extrasCache
      });
    }

    const url = airlineId ? `${enviroment.apiUrl}/airlines/${airlineId}/extras` : `${enviroment.apiUrl}/airlines/extras`;
    return this.http.get<Response<Extra[]>>(url).pipe(
      tap((res: Response<Extra[]>) => {
        if (res && res.data) {
          this.extrasCache = res.data;
          this.extrasCacheTimestamp = Date.now();
        }
      })
    );
  }

  deleteExtra(extraId: number) {
    this.clearExtrasCache();
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/airlines/extras/${extraId}`);
  }

  clearExtrasCache() {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
  }
}
