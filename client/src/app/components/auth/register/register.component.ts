import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { PassengerAsUser } from '../../../../types/users/passenger';
import { AuthService } from '../../../services/auth/auth.service';
import { ParseSourceSpan } from '@angular/compiler';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  registerError: string = '';

  constructor(private authService : AuthService, private router : Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required]
    });
  }

  register(): void {
    this.registerError = '';
    const {email, password, name, surname, confirmPassword} = this.registerForm.value as any;
    if(!email || !password || !name || !surname) {
      this.registerError = 'Tutti i campi sono obbligatori.';
      return;
    }
    if(this.registerForm.get('email')?.invalid) {
      this.registerError = 'Inserisci un indirizzo email valido.';
      return;
    }
    if(password !== confirmPassword) {
      this.registerError = 'Le password non coincidono.';
      return;
    }
    const passenger : PassengerAsUser = {
      email: email ?? '',
      password: password ?? '',
      name: name ?? '',
      surname: surname ?? ''
    };
    this.authService.registerPassenger(passenger).subscribe({
      next: (response: any) => {
        this.router.navigate(['/login'])
      },
      error: (err: any) => {
        if (err?.error?.message === 'Email already in use') {
          this.registerError = 'Questa email è già registrata.';
        } else {
          this.registerError = 'Errore nella registrazione. Riprova.';
        }
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  navigateToHome(): void {
    this.router.navigate(['/search-flights']);
  }
}