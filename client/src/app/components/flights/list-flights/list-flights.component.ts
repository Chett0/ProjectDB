import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FiltersComponent } from '../filters/filters.component';
import { LoadingComponent } from "../../utils/loading/loading.component";

@Component({
  selector: 'app-list-flights',
  imports: [
    CommonModule,
    FiltersComponent,
    LoadingComponent
],
  templateUrl: './list-flights.component.html',
  styleUrl: './list-flights.component.css'
})
export class ListFlightsComponent implements OnInit{

  public flights :  any [] = [];
  public loading : boolean = false;

  constructor(
    private searchFlightsService: SearchFlightsService,
    private route : ActivatedRoute,
    private router : Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const filters = null;
    this.loading = true;

    this.route.queryParams.subscribe(params => {

      const departureDate = params['departureDate'] || null;
      const departureCity = params['departureCity'] || null;
      const destinationCity = params['destinationCity'] || null;

      this.searchFlightsService.searchFlights(departureCity, destinationCity, departureDate, filters).subscribe({
      next: (res: any) => {
        this.flights =  Array.isArray(res.flights) ? [...res.flights] : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.flights = [];
      }
    });
    })
    
  }


  onBuyTicket(flightIds: string[]) {
    const validFlightIds = flightIds.filter(id => id != null); // filtra per i parametri NaN
    this.router.navigate(
      ['flights', 'buy-ticket'],
      { queryParams: {ids: validFlightIds}}
    )
  }

}
