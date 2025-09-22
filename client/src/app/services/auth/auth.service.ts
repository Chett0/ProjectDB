import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../types/users/auth';
import { PassengerAsUser } from '../../../types/users/passenger';
import { BehaviorSubject, Observable, tap } from 'rxjs';


interface AuthResp {
  access_token : string,
  role : string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl : string = 'http://localhost:5000/api'
  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.isLoggedIn.next(!!localStorage.getItem('access_token'))
  }

  login(user : User) {
    return this.http.post<AuthResp>(`${this.apiUrl}/login`, user)
    .pipe(
      tap((response: AuthResp) => {
        localStorage.setItem('access_token', response.access_token);
        this.isLoggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isLoggedIn.next(false);
  }

  registerPassenger(passenger : PassengerAsUser) {
    return this.http.post<void>(`${this.apiUrl}/passengers/register`, passenger);
  }

  registerAirline(airline: { email: string; password: string; name: string; code: string }) {
    return this.http.post<void>(`${this.apiUrl}/airlines/register`, airline);
  }

  //verifica se l'utente è loggato o meno
  /*isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }*/
}