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
    
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
