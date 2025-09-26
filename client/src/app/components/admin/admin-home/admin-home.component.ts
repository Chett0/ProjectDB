
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';


interface Airline {
  id: number;
  email: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  airlineName = '';
  airlineCode = '';
  airlineEmail = '';
  airlinePassword = '';
  airlineConfirmPassword = '';
  feedbackMsg = '';
  feedbackType: 'success' | 'error' | '' = '';
  activeTab = 0;
  airlines: Airline[] = [];
  airlinesCount = 0;
  flightsCount = 0;
  routesCount = 0;
  passengersCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {

    const data = this.route.snapshot.data['adminData'];
    this.airlines = data?.airlines?.airlines || [];
    this.airlinesCount = data?.airlinesCount?.count || 0;
    this.flightsCount = data?.flightsCount?.count || 0;
    this.routesCount = data?.routesCount?.count || 0;
    this.passengersCount = data?.passengersCount?.count || 0;
  }

  addAirline() {
    this.feedbackMsg = '';
    this.feedbackType = '';
    if (!this.airlineName || !this.airlineCode || !this.airlineEmail) {
      this.feedbackMsg = 'Compila tutti i campi.';
      this.feedbackType = 'error';
      return;
    }
    const airline = {
      email: this.airlineEmail,
      name: this.airlineName,
      code: this.airlineCode
    };
    this.authService.registerAirline(airline).subscribe({
      next: (res: any) => {
        let passwordMsg = '';
        if (res && res.Password) {
          passwordMsg = `\nPassword temporanea: ${res.Password}`;
        }
        this.feedbackMsg = 'Compagnia aggiunta!' + passwordMsg;
        this.feedbackType = 'success';
        this.airlineName = '';
        this.airlineCode = '';
        this.airlineEmail = '';

        if (res && res.airline) {
          this.airlines = [...this.airlines, res.airline];
          this.airlinesCount++;
        }
      },
      error: (err) => {
        if (err && err.status === 409) {
          this.feedbackMsg = 'Email già in uso.';
        } else {
          this.feedbackMsg = 'Errore durante la registrazione.';
        }
        this.feedbackType = 'error';
      }
    });
  }

}
