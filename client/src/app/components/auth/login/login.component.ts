import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { User } from '../../../../types/users/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';


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

  constructor(private authService : AuthService, private router : Router) {}

  login() : void {
  this.loginError = '';
  this.loginMsgType = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if(email && password){
      const user : User = {email : email, password : password};
      this.authService.login(user).subscribe({
        next: (response: any) => {
          if (response.role && response.role.toUpperCase() === 'ADMIN') {
            this.loginError = 'Login effettuato con successo!';
            this.loginMsgType = 'success';
            this.router.navigate(['/admin']);
          } else if (response.role && response.role.toUpperCase() === 'USER') {
            this.loginError = 'Login effettuato con successo!';
            this.loginMsgType = 'success';
            this.router.navigate(['/passengers']);
          } else {
            this.loginError = 'Login effettuato con successo!';
            this.loginMsgType = 'success';
            this.router.navigate([`${response.role.toLowerCase()}s`]);
          }
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
      old_password: this.loginForm.value.password!,
      new_password: this.newPassword
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

}
