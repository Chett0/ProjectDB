 
import { inject, Injectable, ResourceLoaderParams } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatedAirline, UserLogin, UserRole } from '../../../types/users/auth';
import { PassengerAsUser } from '../../../types/users/passenger';
import { BehaviorSubject, tap } from 'rxjs';
import { enviroment } from '../../enviroments/enviroments';
import { TokensService } from '../tokens/tokens.service';
import { Router } from '@angular/router';
import { AuthResp, Response } from '../../../types/responses/responses';
import { AirlineAsUser } from '../../../types/users/airlines';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  static redirectPath : string | null = null;
  static redirectQuery : any = null;

  constructor(private http: HttpClient, private token : TokensService, private router : Router) {
    this.isLoggedIn.next(!!localStorage.getItem('access_token'))
  }

  login(user : UserLogin) {
    return this.http.post<Response<AuthResp>>(`${enviroment.apiUrl}/auth/login`, user)
    .pipe(
      tap((response: Response<AuthResp>) => {
        this.token.setTokens(response.data!.accessToken, response.data!.refreshToken);
        localStorage.setItem('access_token', response.data!.accessToken);
        this.isLoggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isLoggedIn.next(false);
    this.token.clearTokens();
    AuthService.clearRedirectPath();
  }

  registerPassenger(passenger : PassengerAsUser) {
    return this.http.post<Response<void>>(`${enviroment.apiUrl}/auth/passengers/register`, passenger);
  }

  registerAirline(airline: AirlineAsUser) {
    return this.http.post<Response<CreatedAirline>>(`${enviroment.apiUrl}/auth/airlines/register`, airline);
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
    return this.http.put<void>(`${enviroment.apiUrl}/password`, data);
  }

  deleteUserByEmail(email: string) {
    return this.http.delete<Response<any>>(`${enviroment.apiUrl}/users/${encodeURIComponent(email)}`);
  }

  reactivateUserByEmail(email: string) {
    return this.http.patch<Response<any>>(`${enviroment.apiUrl}/users/${encodeURIComponent(email)}/activate`, {});
  }

  static clearRedirectPath() {
    AuthService.redirectPath = null;
    AuthService.redirectQuery = null;
  }

  static settingRedirect(state : any) {
    const router = inject(Router)
    AuthService.redirectPath = state.url.split('?')[0];
    AuthService.redirectQuery = router.parseUrl(state.url).queryParams;
    router.navigate(['/login']);
  }

}