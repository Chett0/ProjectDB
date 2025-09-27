import { Component, OnInit } from '@angular/core';
import { CommonModule, NumberSymbol } from '@angular/common';
import { enviroment } from '../../../enviroments/enviroments';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AirlinesService } from '../../../services/airlines/airlines.service';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';
import { RoutesService } from '../../../services/airlines/routes.service';
import { AircraftsComponent } from '../aircrafts/aircrafts.component';
import { RoutesComponent } from '../routes/routes.component';
import { FlightsComponent } from '../flights/flights.component';
import { ExtraComponent } from '../extra/extra.component';
import { FooterComponent } from '../../footer/footer.component';

interface AirlineStats  {
  passenger_count : number,
  monthly_income: number,
  active_routes: number,
  flights_in_progress : number
}

@Component({
  selector: 'app-airlines-home',
  imports: [CommonModule, AircraftsComponent, RoutesComponent, FlightsComponent, ExtraComponent, FooterComponent],
  templateUrl: './airlines-home.component.html',
  styleUrl: './airlines-home.component.css'
})
export class AirlinesHomeComponent implements OnInit{

  homeRoute: string = '.';
  aircraftsRoute: string = 'aircrafts';
  flightsRoute: string = 'flights';
  routesRoute: string = 'routes';
  airlineName: string = '';

  totalAircrafts: number = 0;
  activeRoutes: number = 0;
  totalFlights: number = 0;
  totalPassengers: number = 0;
  constructor(
  private airlinesService : AirlinesService,
  private aircraftsService: AircraftsService,
  private routesService: RoutesService,
    private router : Router,
    private route : ActivatedRoute,
    private authService: AuthService
  ) {}
  activeTab: number = 0; 

  stats : AirlineStats = {
    passenger_count :0,
    monthly_income: 0,
    active_routes: 0,
    flights_in_progress: 0
  };



  ngOnInit(): void {
    this.airlinesService.getAirlinesInfo().subscribe((info: any) => {
      this.airlineName = info?.name || 'Compagnia Aerea';
    });
  // this.aircraftsService.getAircraftsCount().subscribe({
  //     next: (res) => {
  //       if (res && typeof res.count === 'number') this.totalAircrafts = res.count;
  //     },
  //     error: (err) => {
  //       console.error('Errore caricamento conteggio aerei', err);
  //     }
  //   });
  //   this.airlinesService.getAirlineFlightsCount().subscribe({
  //     next: (res) => {
  //       if (res && typeof res.count === 'number') this.totalFlights = res.count;
  //     },
  //     error: (err) => {
  //       console.error('Errore caricamento conteggio voli', err);
  //     }
  //   });
  // this.routesService.getRoutesCount().subscribe({
  //     next: (res) => {
  //       if (res && typeof res.count === 'number') this.activeRoutes = res.count;
  //     },
  //     error: (err) => {
  //       console.error('Errore caricamento conteggio tratte', err);
  //     }
  //   });
  //   this.airlinesService.getPassengersCountAll().subscribe({
  //     next: (res) => {
  //       if (res && typeof res.count === 'number') this.totalPassengers = res.count;
  //     },
  //     error: (err) => {
  //       console.error('Errore caricamento conteggio passeggeri', err);
  //     }
  //   });

    this.airlinesService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats
        console.log(res.stats)
      },
      error: (err) => {
        console.log(err)
      }
    })

  }

  navigateTo(route: string) {
    this.router.navigate([route], { relativeTo: this.route });
  }

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.aircraftsService.clearCache();
    this.routesService.clearCache();
    this.airlinesService.clearExtrasCache();
    this.airlinesService.clearFlightsCache();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
