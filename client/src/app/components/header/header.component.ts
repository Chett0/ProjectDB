import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PassengerService } from '../../services/passenger/passenger.service';
import { TicketBookingService } from '../../services/ticket-booking/ticket-booking.service';
import { UserRole } from '../../../types/users/auth';
import { Response } from '../../../types/responses/responses';
import { PassengerInfo } from '../../../types/users/passenger';
import { AirlinesService } from '../../services/airlines/airlines.service';
import { AircraftsService } from '../../services/airlines/aircrafts.service';
import { RoutesService } from '../../services/airlines/routes.service';
import { ExtrasService } from '../../services/airlines/extras.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isLogged: Observable<boolean> | null = null;
  homePage: string = '/';

  //user data
  userRole: string | null = null;
  passengerName: string = '';
  airlineName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private passengerService: PassengerService,
    private ticketBookingService: TicketBookingService,
    private airlineService: AirlinesService,
    private aircraftsService: AircraftsService,
    private routesService: RoutesService,
    private extrasService: ExtrasService
  ) {}
  
  ngOnInit(): void {
    this.isLogged = this.authService.isLoggedIn;

    this.isLogged.subscribe(isLoggedIn => {
      if(isLoggedIn){
        this.loadUserData();
      } else {
        //reset of user data if log out
        this.userRole = null;
        this.passengerName = '';
        this.airlineName = '';
        this.homePage = '/';
      }
    });
  }

  loadUserData(){
    //check the ROLE
    if(this.authService.hasRole(UserRole.PASSENGER)){
      this.userRole = UserRole.PASSENGER;
      this.homePage='/';
      this.fetchPassengerData();
    } else if (this.authService.hasRole(UserRole.AIRLINE)){
      this.userRole = UserRole.AIRLINE;
      this.homePage='/airlines';
      this.fetchAirlineData();
    } else if (this.authService.hasRole(UserRole.ADMIN)){
      this.userRole = UserRole.ADMIN;
      this.homePage='/admin';
    }
  }

  fetchPassengerData(){
    this.passengerService.getPassengerInfo().subscribe({
      next: (res: Response<PassengerInfo>) => {
        this.passengerName = res.data?.name || '';
      },
      error: (err) => console.error("Error retreiving passenger data", err)
    });
  }

  fetchAirlineData(){
    this.airlineService.getAirlinesInfo().subscribe({
      next: (res) => this.airlineName = res.data?.name || '',
      error: (err) => console.error("Error retreiving airline data", err)
    });
  }

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;

    //clear the cache based on the role

    if(this.userRole === UserRole.PASSENGER) {
      this.passengerService.clearPassengerCache();
      this.ticketBookingService.clearTicketsCache();
    } else if(this.userRole === UserRole.AIRLINE){
      this.extrasService.clearExtrasCache();
      this.airlineService.clearFlightsCache();
      this.routesService.clearRoutesCache();
      this.aircraftsService.clearAircraftsCache();
    }
    //admin doesn't have any cache to delete (?)

    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  goToDashboard(){
    if(this.userRole === UserRole.ADMIN){
      this.router.navigate(['/admin']); //check correctness
    } else if(this.userRole === UserRole.PASSENGER){
      this.router.navigate(['/passengers']);
    } else if(this.userRole === UserRole.AIRLINE){
      this.router.navigate(['/airlines'])
    }
  }
}
