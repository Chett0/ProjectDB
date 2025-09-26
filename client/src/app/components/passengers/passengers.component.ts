import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PassengerService } from '../../services/passenger/passenger.service';

@Component({
  selector: 'app-passengers',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  providers: [DatePipe],
  templateUrl: './passengers.component.html',
  styleUrls: ['./passengers.component.css']
})
export class PassengersComponent {
  passenger = {
    name: '',
    surname: '',
    email: ''
  };
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private passengerService: PassengerService,
    private route: ActivatedRoute
  ) {}

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.passengerService.clearPassengerCache();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch() {
    this.router.navigate(['/']);
  }

  ngOnInit() {

    const data = this.route.snapshot.data['passengerData'];
    if (data && data.passenger && data.passenger.passenger) {
      this.passenger.name = data.passenger.passenger.name;
      this.passenger.surname = data.passenger.passenger.surname;
      this.passenger.email = data.passenger.passenger.user?.email || '';
    } else {
      this.passenger = { name: '', surname: '', email: '' };
    }
    if (data && data.tickets && Array.isArray(data.tickets.tickets)) {
      this.tickets = data.tickets.tickets.map((ticket: any) => this.mapTicket(ticket));
    } else {
      this.tickets = [];
    }
  }

  mapTicket(ticket: any) {
    return {
      airline: ticket.flight?.aircraft?.airline?.name || '',
      code: ticket.flight?.aircraft?.airline?.code || '',
      booking: ticket.id || '',
      from: {
        code: ticket.flight?.route?.departure_airport?.code || '',
        city: ticket.flight?.route?.departure_airport?.city || '',
        time: ticket.flight?.departure_time ? new Date(ticket.flight.departure_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '',
        date: ticket.flight?.departure_time ? this.formatDate(ticket.flight.departure_time) : ''
      },
      to: {
        code: ticket.flight?.route?.arrival_airport?.code || '',
        city: ticket.flight?.route?.arrival_airport?.city || '',
        time: ticket.flight?.arrival_time ? new Date(ticket.flight.arrival_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '',
        date: ticket.flight?.arrival_time ? this.formatDate(ticket.flight.arrival_time) : ''
      },
      seat: ticket.seat?.number || '',
      cabin: ticket.seat?.aircraft_class?.name || '',
      price: ticket.final_cost || 0
    };
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  tickets: any[] = [];
}
