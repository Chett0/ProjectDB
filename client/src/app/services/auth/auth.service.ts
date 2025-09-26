 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserRole } from '../../../types/users/auth';
import { PassengerAsUser } from '../../../types/users/passenger';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { TokensService } from '../tokens/tokens.service';
import { Token } from '@angular/compiler';
import { Router } from '@angular/router';


export interface AuthResp {
  access_token : string,
  refresh_token: string,
  role : string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl : string = 'http://localhost:5000/api'
  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  static redirectUrl : string | null = null;

  constructor(private http: HttpClient, private token : TokensService, private router : Router) {
    this.isLoggedIn.next(!!localStorage.getItem('access_token'))
  }

  login(user : User) {
    return this.http.post<AuthResp>(`${this.apiUrl}/login`, user)
    .pipe(
      tap((response: AuthResp) => {
        this.token.setTokens(response.access_token, response.refresh_token);
        localStorage.setItem('access_token', response.access_token);
        this.isLoggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isLoggedIn.next(false);
    this.token.clearTokens();
    AuthService.redirectUrl = null;
  }

  registerPassenger(passenger : PassengerAsUser) {
    return this.http.post<void>(`${enviroment.apiUrl}/passengers/register`, passenger);
  }

  registerAirline(airline: { email: string; name: string; code: string }) {
    return this.http.post<void>(`${enviroment.apiUrl}/airlines/register`, airline);
  }

  getAccessToken(): string | null {
    return this.token.getAccessToken();
  }

  isAuthenticated(): boolean {
    const token = this.token.getAccessToken();
    if(token) return true;

    // this.router.navigate(['/login'])
    return false;
  }

  hasRole(role: UserRole) : boolean {
    const auth : boolean = this.isAuthenticated();
    if(!auth) return false;

    const userRole : string | null = this.token.getUserRole();
    if(!userRole) return false;

    return userRole === role.valueOf();
  }

  changePassword(data: { email: string; old_password: string; new_password: string }) {
    return this.http.put<void>(`${this.apiUrl}/password`, data);
  }
}