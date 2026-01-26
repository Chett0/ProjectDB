
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { AdminDashboard } from '../../../../types/users/admin';
import { Airline, AirlineAsUser } from '../../../../types/users/airlines';
import { Response } from '../../../../types/responses/responses';
import { CreatedAirline } from '../../../../types/users/auth';

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

  dashboardStats : AdminDashboard = {
    passengersCount: 0,
    airlinesCount: 0,
    activeRoutesCount: 0,
    flightsCount: 0
  }

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

    this.route.data.subscribe(({ adminData }) => {
      if(adminData){
        this.airlines = adminData.airlinesResponse.data || [];
        this.dashboardStats = adminData.dashboardResponse.data;
      }
    });
  }

  addAirline() {
    this.feedbackMsg = '';
    this.feedbackType = '';
    if (!this.airlineName || !this.airlineCode || !this.airlineEmail) {
      this.feedbackMsg = 'Compila tutti i campi.';
      this.feedbackType = 'error';
      return;
    }
    const airline : AirlineAsUser = {
      email: this.airlineEmail,
      name: this.airlineName,
      code: this.airlineCode
    };
    this.authService.registerAirline(airline).subscribe({
      next: (res: Response<CreatedAirline>) => {
        let passwordMsg = '';
        if (res && res.data && res.data.user) {
          passwordMsg = `\nPassword temporanea: ${res.data.user.password}`;
        }
        this.feedbackMsg = 'Compagnia aggiunta!' + passwordMsg;
        this.feedbackType = 'success';
        this.airlineName = '';
        this.airlineCode = '';
        this.airlineEmail = '';
        if (res && res.data && res.data.airline) {
          this.airlines = [...this.airlines, res.data.airline];
          this.dashboardStats.airlinesCount++;
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
