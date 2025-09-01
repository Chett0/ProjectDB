import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { User } from '../../../../types/users/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet} from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email : new FormControl(''),
    password : new FormControl('')
  })

  constructor(private authService : AuthService, private router : Router) {}


  login() : void {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if(email && password){
      const user : User = {email : email, password : password};
      this.authService.login(user).subscribe({
        next: response => {
          localStorage.setItem('access_token', JSON.stringify(response.access_token));
        },
        error: (err) => {

        }
      })
    }
  }

  register() : void {
    this.router.navigate(['/register'])
  }

}
