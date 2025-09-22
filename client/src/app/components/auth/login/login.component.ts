import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { User } from '../../../../types/users/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email : new FormControl(''),
     password : new FormControl('')
  })

  loginError: string = '';

  constructor(private authService : AuthService, private router : Router) {}

  login() : void {
    this.loginError = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if(email && password){
      const user : User = {email : email, password : password};
      this.authService.login(user).subscribe({
        next: (response: any) => {
          // localStorage.setItem('access_token', response.access_token)
          if (response.role && response.role.toUpperCase() === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate([`${response.role.toLowerCase()}s`]);
          }
        },
        error: (err: any) => {
          if (err?.error?.message === 'User not exists') {
            this.loginError = 'Email non registrata.';
          } else if (err?.error?.message === 'Wrong credential') {
            this.loginError = 'Password errata.';
          } else {
            this.loginError = 'Errore di login. Riprova.';
          }
        }
      });
    }
  }

  navigateToRegister() : void {
    this.router.navigate(['/register'])
  }

}
