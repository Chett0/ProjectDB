import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { PassengerAsUser } from '../../../../types/users/passenger';
import { AuthService } from '../../../services/auth/auth.service';
import { ParseSourceSpan } from '@angular/compiler';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

   registerForm = new FormGroup({
    email : new FormControl(''),
    password : new FormControl(''),
    name : new FormControl(''),
    surname : new FormControl('')
  });

  constructor(private authService : AuthService, private router : Router) {}

  register() : void {

    const {email, password, name, surname} = this.registerForm.value
    if(!email || !password || !name || !surname)
      return

    const passenger : PassengerAsUser = {
      email : email,
      password : password,
      name : name, 
      surname : surname
    };

    this.authService.registerPassenger(passenger).subscribe({
        next: response => {
          console.log(response)
          this.router.navigate(['/login'])
        },
        error: (err) => {
          console.log(err)
        }
      })

  }



}
