import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService } from '../../../services/airlines/routes.service';
import { Route, RouteAirport } from '../../../../types/users/airlines';
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

  routes : RouteAirport[] = [];
  filteredRoutes : RouteAirport[] = [];
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
      next: response => {
        this.routes = response.routes || [];
        this.filteredRoutes = this.routes.slice();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
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
      const dep = (r.departure_airport?.name || r.departure_airport?.code || '').toLowerCase();
      const arr = (r.arrival_airport?.name || r.arrival_airport?.code || '').toLowerCase();
      return dep.includes(filter) || arr.includes(filter) || String(r.id).includes(filter);
    });
  }

  trackByRoute(_index: number, r: RouteAirport) {
    return r.id;
  }

  addRoute() {
    if (this.addRouteForm.invalid) {
      this.addRouteForm.markAllAsTouched();
      return;
    }

    const newRoute : Route = {
      departure_airport_code : this.addRouteForm.value.departure_airport!.toUpperCase(),
      arrival_airport_code : this.addRouteForm.value.arrival_airport!.toUpperCase()
    };

    this.submitting = true;
    this.errorMessage = null;

  this.routesService.addRoute(newRoute).subscribe({
      next: response => {
        this.loadRoutes();
        this.addRouteForm.reset();
        this.submitting = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Errore durante l\'aggiunta della tratta.';
        this.submitting = false;
      }
    });
  }

  deleteRoute(route: RouteAirport){
    const confirmed = window.confirm(`Sei sicuro di voler eliminare la tratta: ${route.departure_airport?.code} → ${route.arrival_airport?.code}?`);
    if (!confirmed) return;

    this.deletingId = route.id;
    this.errorMessage = null;

  this.routesService.deleteRoute(route.id).subscribe({
      next: response => {
        this.routes = this.routes.filter(r => r.id !== route.id);
        this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
        this.deletingId = null;
      },
      error: (err) => {
        this.errorMessage = 'Errore durante l\'eliminazione della tratta.';
        this.deletingId = null;
      }
    });

    

  }

  

}
