import { Component, inject } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights.service';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-flights',
  imports: [ReactiveFormsModule, CommonModule],
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
  airports : any[] = []
  flights : any[] = []
  private apiUrl : string = 'http://localhost:5000/'
  loading: boolean = false;

  private sf = inject(SearchFlightsService)

  constructor(private http: HttpClient) {}

  onInputChange(event : any) :  void {
    if(event && event.target.value.length >= 2){
      this.sf.searchLocations(event.target.value).subscribe({
        next: (airports) => {
          this.airports = airports;
          console.log(airports)
        },
        error: (error) => {
          console.error('Error fetching airports:', error);
          this.airports = [];
        }
      })
    }
    else 
      this.airports = []
  }

  searchFlights(): void {
    const { from, to, departure_date } = this.searchForm.value;

    if (!from || !to || !departure_date) {
      return;
    }

    this.loading = true;
    this.sf.searchFlights(from, to, departure_date).subscribe({
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
