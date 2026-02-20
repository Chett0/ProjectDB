import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { CreateExtra, Extra } from '../../../types/users/airlines';
import { Response } from '../../../types/responses/responses';

@Injectable({
  providedIn: 'root'
})
export class ExtraService {

  private extrasCache: Extra[] | null = null;
  private extrasCacheTimestamp: number | null = null;
  private extrasSubject: BehaviorSubject<Extra[]> = new BehaviorSubject<Extra[]>([]);
  private readonly cacheTTL = 2 * 60 * 1000; // 2 minuti

  constructor(private http: HttpClient) {}

  createExtra(extra: CreateExtra): Observable<Response<Extra>> {
    return this.http.post<Response<Extra>>(`${enviroment.apiUrl}/v1/airline/extras`, extra).pipe(
      tap((res: Response<Extra>) => {
        if (res && res.data) {
          if (!this.extrasCache) this.extrasCache = [];
          this.extrasCache.push(res.data);
          this.extrasCacheTimestamp = Date.now();
          this.extrasSubject.next(this.extrasCache.slice());
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
    
    const url = airlineId ? `${enviroment.apiUrl}/v1/airlines/${airlineId}/extras` : `${enviroment.apiUrl}/v1/airline/extras`;
    return this.http.get<Response<Extra[]>>(url).pipe(
      tap((res: Response<Extra[]>) => {
        if (res && res.data) {
          this.extrasCache = res.data;
          this.extrasCacheTimestamp = Date.now();
          this.extrasSubject.next(this.extrasCache.slice());
        }
      })
    );
  }

  deleteExtra(extraId: number) {
    return this.http.delete<Response<void>>(`${enviroment.apiUrl}/v1/airline/extras/${extraId}`).pipe(
      tap(res => {
        if (res && res.success) {
          if (this.extrasCache) this.extrasCache = this.extrasCache.filter(e => e.id !== extraId);
          this.extrasCacheTimestamp = Date.now();
          this.extrasSubject.next(this.extrasCache ? this.extrasCache.slice() : []);
        } else {
          this.getExtras(undefined, true).subscribe();
        }
      },
      () => {
        this.getExtras(undefined, true).subscribe();
      })
    );
  }

  
  clearExtrasCache() {
    this.extrasCache = null;
    this.extrasCacheTimestamp = null;
    this.extrasSubject.next([]);
  }

  watchExtras(): Observable<Extra[]> {
    if (!this.extrasCache || this.extrasCache.length === 0) {
      this.getExtras().subscribe({ next: () => {}, error: () => {} });
    }
    return this.extrasSubject.asObservable();
  }
}
