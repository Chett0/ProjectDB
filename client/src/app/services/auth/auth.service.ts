import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../types/users/auth';
import { PassengerAsUser } from '../../../types/users/passenger';


interface AuthResp {
  access_token : string,
  role : string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  private apiUrl : string = 'http://localhost:5000/api'

  login(user : User) {
    return this.http.post<AuthResp>(`${this.apiUrl}/login`, user);
  }

  registerPassenger(passenger : PassengerAsUser) {
    return this.http.post<void>(`${this.apiUrl}/passengers/register`, passenger);
  }

}
