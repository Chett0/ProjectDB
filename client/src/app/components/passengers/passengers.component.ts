import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PassengerService } from '../../services/passenger/passenger.service';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { PassengerInfo } from '../../../types/users/passenger';

@Component({
  selector: 'app-passengers',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  providers: [DatePipe],
  templateUrl: './passengers.component.html',
  styleUrls: ['./passengers.component.css']
})
export class PassengersComponent {
  passenger : PassengerInfo = {
    id: 0,
    name: '',
    surname: '',
    email: ''
  }
  message : string = '';

  editing: boolean = false;
  editName: string = '';
  editSurname: string = '';

  tickets: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private passengerService: PassengerService,
    private route: ActivatedRoute,
    private ticketService : TicketBookingService
  ) {}

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.passengerService.clearPassengerCache();
    this.ticketService.clearTicketsCache();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch() {
    this.router.navigate(['/']);
  }

  ngOnInit() {

    this.route.data.subscribe(({ passengerData }) => {
      if(passengerData){
        if(passengerData.passengerResponse && passengerData.passengerResponse.success && passengerData.passengerResponse.data)
          this.passenger = passengerData.passengerResponse.data;
      }
    })


    const saved = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (saved && saved.name && saved.surname) {
      this.passenger.name = saved.name;
      this.passenger.surname = saved.surname;
    }
    this.editName = this.passenger.name;
    this.editSurname = this.passenger.surname;
    
  }

  startEdit() {
    this.editing = true;
    this.editName = this.passenger.name;
    this.editSurname = this.passenger.surname;
    this.message = '';
  }

  cancelEdit() {
    this.editing = false;
    this.editName = this.passenger.name;
    this.editSurname = this.passenger.surname;
    this.message = '';
  }

  saveEdit() {
    if (!this.editName || !this.editSurname) {
      this.message = 'Nome e cognome non possono essere vuoti.';
      return;
    }
    if (this.editName.length > 50 || this.editSurname.length > 50) {
      this.message = 'Limite 50 caratteri per nome e cognome.';
      return;
    }

    this.passengerService.updatePassenger({ name: this.editName, surname: this.editSurname }).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.passenger = res.data;
          localStorage.setItem('userProfile', JSON.stringify({ name: this.passenger.name, surname: this.passenger.surname }));
          this.message = 'Modifiche salvate.';
          this.editing = false;
        } else {
          this.message = 'Aggiornamento non riuscito.';
        }
      },
      error: (err: any) => {
        console.error(err);
        this.message = err?.error?.message || 'Errore nel salvataggio.';
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
