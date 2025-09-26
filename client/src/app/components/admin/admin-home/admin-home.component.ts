
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { AirlinesService } from '../../../services/airlines/airlines.service';
import { RoutesService } from '../../../services/airlines/routes.service';
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
    private airlinesService: AirlinesService,
    private routesService: RoutesService,
    private router: Router
  ) {}

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.loadAirlines();
    this.loadAirlinesCount();
    this.loadFlightsCount();
    this.loadRoutesCount();
    this.loadPassengersCount();
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
        this.loadAirlines();
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

  loadAirlines() {
    this.airlinesService.getAllAirlines().subscribe({
      next: (res) => {
        if (res && res.airlines) this.airlines = res.airlines;
      },
      error: (err) => {
        console.error('Error loading airlines', err);
      }
    });
  }

  loadAirlinesCount() {
    this.airlinesService.getAirlinesCount().subscribe({
      next: (res) => {
        if (res && typeof res.count === 'number') this.airlinesCount = res.count;
      },
      error: (err) => {
        console.error('Error loading airlines count', err);
      }
    });
  }

  loadFlightsCount() {
    this.airlinesService.getFlightsCountAll().subscribe({
      next: (res) => {
        if (res && typeof res.count === 'number') this.flightsCount = res.count;
      },
      error: (err) => {
        console.error('Error loading flights count', err);
      }
    });
  }

  loadRoutesCount() {
  this.routesService.getRoutesCountAll().subscribe({
      next: (res) => {
        if (res && typeof res.count === 'number') this.routesCount = res.count;
      },
      error: (err) => {
        console.error('Error loading routes count', err);
      }
    });
  }

  loadPassengersCount() {
    this.airlinesService.getPassengersCount().subscribe({
      next: (res) => {
        if (res && typeof res.count === 'number') this.passengersCount = res.count;
      },
      error: (err) => {
        console.error('Error loading passengers count', err);
      }
    });
  }
}
