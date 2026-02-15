import { Component, OnInit } from '@angular/core';
import { CommonModule, NumberSymbol } from '@angular/common';
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
import { AirlineDashBoard } from '../../../../types/users/airlines';
import { AirlineDashboardComponent } from '../airline-dashboard/airline-dashboard.component';
import { HeaderComponent } from '../../header/header.component';
import { ExtraService } from '../../../services/airlines/extras.service';

@Component({
  selector: 'app-airlines-home',
  imports: [CommonModule, AircraftsComponent, RoutesComponent, FlightsComponent, ExtraComponent, FooterComponent, AirlineDashboardComponent,HeaderComponent],
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
    private extraService: ExtraService,
    private aircraftsService: AircraftsService,
    private routesService: RoutesService,
    private router : Router,
    private route : ActivatedRoute,
    private authService: AuthService
  ) {}
  activeTab: number = 0; 

  dashboardStats : AirlineDashBoard = {
    passengerCount: 0,
    monthlyIncome: 0,
    activeRoutes: 0,
    flightsInProgress: 0,
    routesMostInDemand: [],
    monthlyIncomes: []
  }

  tabs: { label: string; component: any }[] = [
    { label: 'Dashboard', component: AirlineDashboardComponent },
    { label: 'Aerei', component: AircraftsComponent },
    { label: 'Voli', component: FlightsComponent },
    { label: 'Tratte', component: RoutesComponent },
    { label: 'Extra', component: ExtraComponent },
    { label: 'Settings', component: null }
  ];

  get activeComponent(): any {
    return this.tabs[this.activeTab].component;
  }




  ngOnInit(): void {

    this.route.data.subscribe(({ airlineData }) => {
      if(airlineData){
        this.dashboardStats = airlineData.dashboardStatsResponse.data;
      }
    });

    this.airlinesService.getAirlinesInfo().subscribe((info: any) => {
      this.airlineName = info?.data.name || 'Compagnia Aerea';
    });

  }

  navigateTo(route: string) {
    this.router.navigate([route], { relativeTo: this.route });
  }

  onLogout() {
    const confirmed = confirm('Sei sicuro di voler effettuare il logout?');
    if (!confirmed) return;
    this.aircraftsService.clearCache();
    this.routesService.clearCache();
    this.extraService.clearExtrasCache();
    this.airlinesService.clearFlightsCache();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setTab(index: number) {
    this.activeTab = index;
  }

}
