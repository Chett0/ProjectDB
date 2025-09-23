import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { AuthResp } from '../auth/auth.service';
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
    localStorage.removeItem('refresh_token');
    this.accessToken.next(null);
    this.clearRefresh();
  }

  private clearRefresh() {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
  }

  setTokens(access_token: string, refresh_token?: string | null) {
    this.accessToken.next(access_token);
    localStorage.setItem('access_token', access_token);
    if(refresh_token)
      localStorage.setItem('refresh_token', refresh_token);

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


  refreshToken(): Observable<AuthResp> {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    return this.http.post<AuthResp>(`${enviroment.apiUrl}/refresh`, null, {
      headers: { Authorization: `Bearer ${refresh_token}` }
    }).pipe(
      tap((response: AuthResp) => {
        this.setTokens(response.access_token);
      }),
      catchError(() => {
        this.clearTokens();
        throw new Error('Token refresh failed');
      })
    );
  }

}
