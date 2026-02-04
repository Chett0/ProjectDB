import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SearchFlightsService } from '../../../services/search-flights/search-flights.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../utils/loading/loading.component";
import { Response } from '../../../../types/responses/responses';
import { Filters, Journeys } from '../../../../types/flights/flights';
import { filter } from 'rxjs';
import { TicketService } from '../../../services/ticket/ticket.service';

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

  public journeys :  Journeys[] = [];
  public loading : boolean = false;

  constructor(
    private searchFlightsService: SearchFlightsService,
    private ticketService: TicketService,
    private route : ActivatedRoute,
    private router : Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loading = true;

    this.route.queryParams.subscribe(params => {

      const departureDate : string = params['departureDate'];
      const departureCity : string = params['departureCity'];
      const destinationCity : string = params['destinationCity'];

      const filters : Filters = {
        maxPrice : params['maxPrice'],
        nStops : params['nStops'],
        sortBy : params['sortBy'],
        order: params['order']
      };

      this.searchFlights(departureDate, departureCity, destinationCity, filters);
    })
    
  }

  searchFlights(departureDate: string, departureCity: string, destinationCity: string, filters: Filters) : void {
    this.searchFlightsService.searchFlights(departureCity, destinationCity, departureDate, filters).subscribe({
      next: (res: Response<Journeys[]>) => {
        this.journeys =  res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.journeys = [];
      }
    });
  }


  onBuyTicket(journey: Journeys) : void {

    this.ticketService.setJourneys(journey);

    const flightIds : number[] = [];

    journey.flights.forEach(flight => {
      flightIds.push(flight.id);
    });

    this.router.navigate(['booking'], {  
      queryParams: {
        ids: flightIds
      } 
    });
    
  }

}
