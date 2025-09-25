import { Component, inject, Input, OnInit } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights.service';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../header/header.component';

export interface PriceRange {
  min: number;
  max: number;
}

@Component({
  selector: 'app-search-flights',
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, FormsModule],
  templateUrl: './search-flights.component.html',
  styleUrls: ['./search-flights.component.css']
})
export class SearchFlightsComponent {

  searchForm = new FormGroup({
    from : new FormControl(''),
    to : new FormControl(''),
    departure_date : new FormControl(''),
    arrival_date : new FormControl('')
  });
  cities : any[] = []
  flights : any[] = []
  loading: boolean = false;

  filters = {
    minPrice: 0,
    maxPrice: 10000,
    nonStop: false,
    oneStop: true,
    sort: {
      sort_by : 'departure_time',  //price, total_duration, departure_time
      order: 'asc'        //asc desc
    }     
  };

  private sf = inject(SearchFlightsService)

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onInputChange(event : any) :  void {
    if(event && event.target.value.length >= 2){
      this.sf.searchLocations(event.target.value).subscribe({
        next: (res : any) => {
          this.cities = res.cities;
          console.log(this.cities)
        },
        error: (error) => {
          console.error('Error fetching airports:', error);
          this.cities = [];
        }
      })
    }
    else 
      this.cities = []
  }

  onBuyTicket(flightId: string) {
    this.router.navigate(['flights', flightId, 'buy-ticket'])
  }

  searchFlights(): void {
    const { from, to, departure_date } = this.searchForm.value;

    if (!from || !to || !departure_date) {
      return;
    }

    this.loading = true;
    this.sf.searchFlights(from, to, departure_date, this.filters).subscribe({
      next: (res: any) => {
        this.flights = res.flights;
        this.loading = false;
        console.log('Voli trovati:', this.flights);
      },
      error: (err) => {
        console.error('Errore durante la ricerca voli:', err);
        this.loading = false;
      }
    });
  }
}
