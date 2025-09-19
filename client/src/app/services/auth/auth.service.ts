import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../types/users/auth';
import { PassengerAsUser } from '../../../types/users/passenger';
import { BehaviorSubject, Observable, tap } from 'rxjs';


interface AuthResp {
  access_token : string,
  refresh_token: string,
  role : string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private accessToken = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  private apiUrl : string = 'http://localhost:5000/api'

  private setTokens(access_token: string, refresh_token?: string | null) {
    this.accessToken.next(access_token);
    localStorage.setItem('access_token', access_token);
    if(refresh_token)
      localStorage.setItem('refresh_token', refresh_token);
  }


  login(user : User) {
    return this.http.post<AuthResp>(`${this.apiUrl}/login`, user).pipe(
      tap((response : AuthResp) => {
        this.setTokens(response.access_token, response.refresh_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  registerPassenger(passenger : PassengerAsUser) {
    return this.http.post<void>(`${this.apiUrl}/passengers/register`, passenger);
  }

  registerAirline(airline: { email: string; password: string; name: string; code: string }) {
    return this.http.post<void>(`${this.apiUrl}/airlines/register`, airline);
  }


  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }


  refreshToken() : Observable<any> {
    const refresh_token = localStorage.getItem('refresh_token');
    console.log(refresh_token);
    
    return this.http.post<any>(`${this.apiUrl}/refresh`, null,{
      headers: { Authorization: `Bearer ${refresh_token}` }
    }).pipe(
      tap((response : AuthResp) => {
        this.setTokens(response.access_token);
      })
    )
  }

}