import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights/search-flights.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../utils/loading/loading.component";
import { APIResponse } from '../../../../types/responses/responses';
import { Journeys } from '../../../../types/flights/flights';

@Component({
  selector: 'app-list-flights',
  imports: [
    CommonModule,
    LoadingComponent
],
  templateUrl: './list-flights.component.html',
  styleUrl: './list-flights.component.css'
})
export class ListFlightsComponent implements OnInit{

  public flights :  Journeys[] = [];
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

      const filters = {
        maxPrice : params['maxPrice'] || null,
        nStop : params['nStop'] || null,
        sortBy : params['sortBy'] || null,
        order: params['order'] || null
      }


      this.searchFlightsService.searchFlights(departureCity, destinationCity, departureDate, filters).subscribe({
      next: (res: APIResponse<Journeys[]>) => {
        this.flights =  res.data || [];
        console.log(this.flights);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.flights = [];
      }
    });
    })
    
  }


  onBuyTicket(flightIds: number[] | (number | undefined)[]) : void {
    const validFlightIds = flightIds?.filter(id => id != null); // filtra per i parametri NaN
    this.router.navigate(
      ['flights', 'buy-ticket'],
      { queryParams: {ids: validFlightIds}}
    )
  }

}
