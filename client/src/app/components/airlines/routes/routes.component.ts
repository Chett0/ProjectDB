import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService } from '../../../services/airlines/routes.service';
import { AirlineRoute, Route } from '../../../../types/users/airlines';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-routes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements OnInit{

  constructor(private routesService : RoutesService, private router : Router) {}

  routes : AirlineRoute[] = [];
  filteredRoutes : AirlineRoute[] = [];
  loading = false;
  submitting = false;
  deletingId: number | null = null;
  errorMessage: string | null = null;
  showAddModal: boolean = false;
  searchControl = new FormControl('');

  addRouteForm = new FormGroup({
    departure_airport: new FormControl('', [Validators.required, Validators.maxLength(3)]),
    arrival_airport: new FormControl('', [Validators.required, Validators.maxLength(3)])
  });

  ngOnInit(): void {

    this.loadRoutes();

    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(String(value || '').trim().toLowerCase());
    });
  }

  loadRoutes() {
    
    this.loading = true;
    this.errorMessage = null;
    this.routesService.getRoutes().subscribe({
      next: res => {
        if(res.success){
          this.routes = res.data || [];
          this.filteredRoutes = this.routes.slice();
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossibile caricare le tratte.';
        this.loading = false;
      }
    });
  }

  applyFilter(filter: string) {
    if (!filter) {
      this.filteredRoutes = this.routes.slice();
      return;
    }
    this.filteredRoutes = this.routes.filter(r => {
      const dep = (r.departureAirport?.name || r.departureAirport?.code || '').toLowerCase();
      const arr = (r.arrivalAirport?.name || r.arrivalAirport?.code || '').toLowerCase();
      return dep.includes(filter) || arr.includes(filter) || String(r.id).includes(filter);
    });
  }

  trackByRoute(_index: number, r: AirlineRoute) {
    return r.id;
  }

  addRoute() {
    if (this.addRouteForm.invalid) {
      this.addRouteForm.markAllAsTouched();
      return;
    }

    const newRoute : Route = {
      departureAirportCode : this.addRouteForm.value.departure_airport!.toUpperCase(),
      arrivalAirportCode : this.addRouteForm.value.arrival_airport!.toUpperCase()
    };

    this.submitting = true;
    this.errorMessage = null;

  this.routesService.addRoute(newRoute).subscribe({
      next: response => {
        this.addRouteForm.reset();
        if(response.success && response.data){
          this.routes.push(response.data);
          this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
        }
        this.submitting = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Errore durante l\'aggiunta della tratta.';
        this.submitting = false;
      }
    });
  }

  deleteRoute(route: AirlineRoute){
    const confirmed = window.confirm(`Sei sicuro di voler eliminare la tratta: ${route.departureAirport.code} → ${route.arrivalAirport.code}?`);
    if (!confirmed) return;

    this.deletingId = route.id;
    this.errorMessage = null;

  this.routesService.deleteRoute(route.id).subscribe({
      next: res => {
        if(res.success){
          this.routes = this.routes.filter(r => r.id !== route.id);
          this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
          this.routesService.clearCache();
          this.deletingId = null;
        }
      },
      error: (err) => {
        this.errorMessage = 'Errore durante l\'eliminazione della tratta.';
        this.deletingId = null;
      }
    });

    

  }

  

}
