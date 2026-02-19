
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { Airline, AirlineAsUser } from '../../../../types/users/airlines';
import { Response } from '../../../../types/responses/responses';
import { CreatedAirline } from '../../../../types/users/auth';
import { HeaderComponent } from '../../header/header.component';
import { UserDTO } from '../../../../types/users/user';
import { AdminDashboard } from '../../../../types/users/admin';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule, FooterComponent, HeaderComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  airlineName = '';
  airlineCode = '';
  airlineEmail = '';
  airlinePassword = '';
  airlineConfirmPassword = '';

  addFeedbackMsg = '';
  addFeedbackType: 'success' | 'error' | '' = '';
  userFeedbackMsg = '';
  userFeedbackType: 'success' | 'error' | '' = '';
  
  searchQuery = '';
  activeTab: number = 0;
  airlines: Airline[] = [];
  deleteEmail: string = '';

  dashboardStats: AdminDashboard | null = null;



  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.data.subscribe(({ adminData }) => {
      if(adminData){
        this.airlines = adminData.airlinesResponse.data || [];
        this.dashboardStats = adminData.dashbboardStatsResponse.data || null;
      }
    });
  }

  addAirline() {
    this.addFeedbackMsg = '';
    this.addFeedbackType = '';
    if (!this.airlineName || !this.airlineCode || !this.airlineEmail) {
      this.addFeedbackMsg = 'Compila tutti i campi.';
      this.addFeedbackType = 'error';
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
        this.addFeedbackMsg = 'Compagnia aggiunta!' + passwordMsg;
        this.addFeedbackType = 'success';
        this.airlineName = '';
        this.airlineCode = '';
        this.airlineEmail = '';
        if (res && res.data && res.data.airline) {
          this.airlines = [...this.airlines, res.data.airline];
        }
      },
      error: (err) => {
        this.addFeedbackMsg = err && err.status === 409 ? 'Email già in uso.' : 'Errore durante la registrazione.';
        this.addFeedbackType = 'error';
      }
    });
  }

  deleteUserByEmail() {
    this.userFeedbackMsg = '';
    this.userFeedbackType = '';
    if (!this.deleteEmail) {
      this.userFeedbackMsg = 'Inserisci un email.';
      this.userFeedbackType = 'error';
      return;
    }

    const confirmed = confirm(`Eliminare l'utente con email ${this.deleteEmail}?`);
    if (!confirmed) return;

    this.authService.deleteUserByEmail(this.deleteEmail).subscribe({
      next: (res: Response<UserDTO>) => {
        this.userFeedbackMsg = 'Utente eliminato con successo.';
        this.userFeedbackType = 'success';
        this.deleteEmail = '';
      },
      error: (err) => {
        this.userFeedbackMsg = err && err.status === 404 ? 'Utente non trovato.' : 'Errore durante l\'eliminazione.';
        this.userFeedbackType = 'error';
      }
    });
  }

  reactivateUserByEmail() {
    this.userFeedbackMsg = '';
    this.userFeedbackType = '';
    if (!this.deleteEmail) {
      this.userFeedbackMsg = 'Inserisci un email.';
      this.userFeedbackType = 'error';
      return;
    }

    const confirmed = confirm(`Riattivare l'utente con email ${this.deleteEmail}?`);
    if (!confirmed) return;

    this.authService.reactivateUserByEmail(this.deleteEmail).subscribe({
      next: (res: Response<UserDTO>) => {
        this.userFeedbackMsg = 'Utente riattivato con successo.';
        this.userFeedbackType = 'success';
        this.deleteEmail = '';
      },
      error: (err) => {
        this.userFeedbackMsg = err && err.status === 404 ? 'Utente non trovato.' : 'Errore durante la riattivazione.';
        this.userFeedbackType = 'error';
      }
    });
  }

  get filteredAirlines(): Airline[] {
    const q = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';
    if (!q) return this.airlines;
    return this.airlines.filter(a => {
      const name = (a.name || '').toLowerCase();
      const code = (a.code || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }

}
