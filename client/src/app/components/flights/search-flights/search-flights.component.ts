import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../header/header.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';

import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-search-flights',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    RouterOutlet,
    FooterComponent
],
  providers : [provideNativeDateAdapter(), DatePipe],
  templateUrl: './search-flights.component.html',
  styleUrls: ['./search-flights.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightsComponent implements OnInit{

  @ViewChild('departureCity') departureCity!: ElementRef<HTMLInputElement>;
  @ViewChild('destinationCity') destinationCity!: ElementRef<HTMLInputElement>;
  searchForm = new FormGroup({
    from : new FormControl(''),
    to : new FormControl(''),
    departure_date : new FormControl(''),
    arrival_date : new FormControl('')
  });
  cities : string[] = []
  filteredDepartureCities: string[] = [];
  filteredDestinationCities: string[] = [];
  flights : any[] = [];

  
  constructor(
    private authService: AuthService,
    private router: Router,
    private searchFlightsService: SearchFlightsService,
    private datePipe : DatePipe,
    private route: ActivatedRoute
  ) {
    this.searchFlightsService.getCities().subscribe({
      next: (res : any) => {
        this.cities = res.cities;
      },
      error: (error) => {
          this.cities = [];
        }
    })
  }

  ngOnInit(): void {
    if(this.cities.length === 0){
      this.searchFlightsService.getCities().subscribe({
        next: (res : any) => {
          this.cities = res.cities;
          this.filteredDepartureCities = this.cities;
          this.filteredDestinationCities = this.cities;
        },
        error: (error) => {
          console.log(error)
            this.cities = [];
          }
      })
    }
    
  }

  searchFlights(): void {
    const { from, to, departure_date } = this.searchForm.value;

    const rawDate = departure_date;
    const formattedDate = this.datePipe.transform(rawDate, 'yyyy-MM-dd');

    if (!from || !to || !formattedDate) {
      return;
    }

    const filters = {
      departureCity : from,
      destinationCity: to,
      departureDate: formattedDate
    };
    this.router.navigate(['flights'], { 
      relativeTo: this.route, 
      queryParams: filters 
    });
    }


  filterDepartureCities(): void {
    const filterValue = this.departureCity.nativeElement.value.toLowerCase();
    this.filteredDepartureCities =  this.cities.filter(o => o.toLowerCase().includes(filterValue));
  }

  filterDestinationCities(): void {
    const filterValue = this.destinationCity.nativeElement.value.toLowerCase();
    this.filteredDestinationCities = this.cities.filter(o => o.toLowerCase().includes(filterValue));
  }
}
