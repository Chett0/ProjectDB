import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  
  private accessToken : BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private refreshTimeout: any;
  private jwtHelper = new JwtHelperService();

  constructor(private http : HttpClient) { }

  private getTokenExpiration(token: string) : number {
    const payload: JwtPayload = jwtDecode(token);
    return payload.exp! * 1000;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.role || null;
  }

  clearTokens() : void {
    localStorage.removeItem('access_token');
    this.accessToken.next(null);
    this.clearRefresh();
  }

  private clearRefresh() {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
  }

  setTokens(access_token: string) {
    this.accessToken.next(access_token);
    localStorage.setItem('access_token', access_token);
    this.scheduleRefresh();
  }

  scheduleRefresh() : void {
    const access_token = this.getAccessToken();
    if(!access_token) return;

    const exp = this.getTokenExpiration(access_token);
    const now = Date.now();
    const timeout = exp - now - 30 * 1000;

    if (timeout <= 0) {
      this.performRefresh();
    } else {
      this.refreshTimeout = setTimeout(() => this.performRefresh(), timeout);
    }
  }

  private performRefresh() {
    this.refreshToken().subscribe({
      next: () => {}, 
      error: () => this.clearTokens()
    });
  }


  refreshToken(): Observable<any> {
    
    return this.http.post<any>(`${enviroment.apiUrl}/v1/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        const newAccess = response?.data?.accessToken || response?.accessToken;
        if (newAccess) this.setTokens(newAccess);
      }),
      catchError(() => {
        this.clearTokens();
        throw new Error('Token refresh failed');
      })
    );
  }

  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.jwtHelper.isTokenExpired(token);
  }

}
