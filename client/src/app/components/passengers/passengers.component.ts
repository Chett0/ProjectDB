import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PassengerService } from '../../services/passenger/passenger.service';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { PassengerInfo } from '../../../types/users/passenger';
import { Response } from '../../../types/responses/responses';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-passengers',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, HeaderComponent],
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

  public ticketsTotal: number = 0;
  public ticketsPage: number = 1;
  public ticketsLimit: number = 5;

  public totalFlights: number = 0;
  public flightHoursDisplay: string = '0h 0m';
  public moneySpent: number = 0;

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

        
        if (passengerData.tickets) {
          const payload = passengerData.tickets?.data ? passengerData.tickets.data : passengerData.tickets;
          this.tickets = payload?.tickets || [];
          this.ticketsTotal = payload?.total || 0;
          this.ticketsPage = payload?.page || this.ticketsPage;
          this.ticketsLimit = payload?.limit || this.ticketsLimit;
        } else {
          this.loadTickets(this.ticketsPage);
        }

        // load passenger stats
        this.passengerService.getPassengerStats().subscribe({
          next: (res: any) => {
            const payload = res?.data ? res.data : res;
            this.totalFlights = payload?.totalFlights || 0;
            const fh = payload?.flightHours || { hours: 0, minutes: 0 };
            this.flightHoursDisplay = `${fh.hours}h ${fh.minutes}m`;
            this.moneySpent = payload?.moneySpent || 0;
          },
          error: (err) => {
            console.error('Error loading passenger stats', err);
          }
        });
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

  loadTickets(page: number = 1) {
    this.ticketsPage = page;
    this.ticketService.getTickets(page, this.ticketsLimit).subscribe({
      next: (res: any) => {
        const payload = res?.data ? res.data : res;
        this.tickets = payload?.tickets || [];
        this.ticketsTotal = payload?.total || 0;
        this.ticketsPage = payload?.page || page;
        this.ticketsLimit = payload?.limit || this.ticketsLimit;
      },
      error: (err) => {
        console.error('Error loading tickets', err);
        this.tickets = [];
        this.ticketsTotal = 0;
      }
    });
  }

  getTicketsTotalPages(): number {
    return Math.max(1, Math.ceil(this.ticketsTotal / this.ticketsLimit));
  }

  getVisibleTicketPages(): Array<number | '...'> {
    const totalPages = this.getTicketsTotalPages();
    const current = this.ticketsPage;
    const edge = 1;
    const around = 1;

    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [];
    for (let i = 1; i <= edge; i++) pages.push(i);
    if (current - around > edge + 1) pages.push('...');
    const start = Math.max(edge + 1, current - around);
    const end = Math.min(totalPages - edge, current + around);
    for (let p = start; p <= end; p++) pages.push(p);
    if (current + around < totalPages - edge) pages.push('...');
    for (let i = totalPages - edge + 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  setTicketsPage(p: number) {
    const totalPages = this.getTicketsTotalPages();
    if (p < 1 || p > totalPages) return;
    this.loadTickets(p);
  }

  prevTicketsPage() { this.setTicketsPage(this.ticketsPage - 1); }
  nextTicketsPage() { this.setTicketsPage(this.ticketsPage + 1); }

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
      next: (res: Response<PassengerInfo>) => {
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
