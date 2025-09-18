
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {
  airlineName = '';
  airlineCode = '';
  airlineEmail = '';
  airlinePassword = '';
  feedbackMsg = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(private authService: AuthService) {}

  addAirline() {
    this.feedbackMsg = '';
    this.feedbackType = '';
    if (!this.airlineName || !this.airlineCode || !this.airlineEmail || !this.airlinePassword) {
      this.feedbackMsg = 'Compila tutti i campi.';
      this.feedbackType = 'error';
      return;
    }
    const airline = {
      email: this.airlineEmail,
      password: this.airlinePassword,
      name: this.airlineName,
      code: this.airlineCode
    };
    this.authService.registerAirline(airline).subscribe({
      next: () => {
        this.feedbackMsg = 'Compagnia aggiunta!';
        this.feedbackType = 'success';
        this.airlineName = '';
        this.airlineCode = '';
        this.airlineEmail = '';
        this.airlinePassword = '';
      },
      error: (err) => {
        if (err.status === 409) {
          this.feedbackMsg = 'Email già in uso.';
        } else {
          this.feedbackMsg = 'Errore durante la registrazione.';
        }
        this.feedbackType = 'error';
      }
    });
  }
}
