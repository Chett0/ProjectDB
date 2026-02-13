import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { UserLogin } from '../../../../types/users/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthResp, Response } from '../../../../types/responses/responses';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email : new FormControl(''),
    password : new FormControl('')
  });
  loginError: string = '';
  loginMsgType: 'success' | 'error' | '' = '';
  showChangePassword: boolean = false;
  newPassword: string = '';
  confirmNewPassword: string = '';
  tempEmail: string = '';

  constructor(private authService : AuthService, private router : Router, private location: Location) {}

  login() : void {
  this.loginError = '';
  this.loginMsgType = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if(email && password){
      const user : UserLogin = {email : email, password : password};
      this.authService.login(user).subscribe({
        next: (response: Response<AuthResp>) => {
            this.loginError = 'Login effettuato con successo!';
            this.loginMsgType = 'success';
            let redirect = '';
            if(AuthService.redirectPath){
              const path = AuthService.redirectPath;
              const params = AuthService.redirectQuery;
              AuthService.clearRedirectPath();
              console.log(path, params)
              this.router.navigate([path], {
                queryParams : params
              });
              return;
            }
          if (response.data?.role && response.data.role.toUpperCase() === 'ADMIN') 
            redirect = '/admin';
           else if (response.data?.role && response.data.role.toUpperCase() === 'PASSENGER')
            redirect = '/passengers';
           else if (response.data?.role && response.data.role.toUpperCase() === 'AIRLINE')
            redirect = '/airlines';
           this.router.navigate([redirect]);
        },
        error: (err: any) => {
          if (err?.status === 303) {
            this.showChangePassword = true;
            this.tempEmail = email;
            this.loginError = 'Devi cambiare la password temporanea.';
            this.loginMsgType = 'error';
          } else if (err?.error?.message === 'User not exists') {
            this.loginError = 'Email non registrata.';
            this.loginMsgType = 'error';
          } else if (err?.error?.message === 'Wrong credential') {
            this.loginError = 'Password errata.';
            this.loginMsgType = 'error';
          } else {
            this.loginError = 'Errore di login. Riprova.';
            this.loginMsgType = 'error';
          }
        }
      });
    }

  }

  changePassword() {
  this.loginError = '';
  this.loginMsgType = '';
    if (!this.newPassword || !this.confirmNewPassword) {
      this.loginError = 'Compila entrambi i campi.';
      this.loginMsgType = 'error';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.loginError = 'Le nuove password non coincidono.';
      this.loginMsgType = 'error';
      return;
    }
    this.authService.changePassword({
      email: this.tempEmail,
      oldPassword: this.loginForm.value.password!,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loginError = 'Password cambiata con successo. Effettua nuovamente il login.';
        this.loginMsgType = 'success';
        this.showChangePassword = false;
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.loginForm.patchValue({ password: '' });
      },
      error: () => {
        this.loginError = 'Errore durante il cambio password.';
        this.loginMsgType = 'error';
      }
    });
  }

  navigateToRegister() : void {
    this.router.navigate(['/register'])
  }

  navigateToHome(): void {
    this.router.navigate(['/search-flights']);
  }

}
