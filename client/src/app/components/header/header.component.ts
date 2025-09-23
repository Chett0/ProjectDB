import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PassengerService } from '../../services/passenger/passenger.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isLogged: Observable<boolean> | null = null;
  passengerName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private passengerService: PassengerService
  ) {}
  
  ngOnInit(): void {
    this.isLogged = this.authService.isLoggedIn;
    this.passengerService.getPassengerInfo().subscribe({
      next: (data: any) => {
          this.passengerName = data.passenger.name
      },
      error: (err) => console.error(err)
    })
  }

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
