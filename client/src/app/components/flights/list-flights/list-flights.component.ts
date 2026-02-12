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
  public total: number = 0;
  public page: number = 1;
  public limit: number = 10;

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

      const page: number = params['page'] ? parseInt(params['page']) : 1;
      const limit: number = params['limit'] ? parseInt(params['limit']) : 10;

      this.page = page;
      this.limit = limit;

      this.searchFlights(departureDate, departureCity, destinationCity, filters, page, limit);
    })
    
  }

  searchFlights(departureDate: string, departureCity: string, destinationCity: string, filters: Filters, page: number = 1, limit: number = 10) : void {
    this.searchFlightsService.searchFlights(departureCity, destinationCity, departureDate, filters, page, limit).subscribe({
      next: (res: Response<{ journeys: Journeys[]; total: number; page: number; limit: number }>) => {
        const payload = res.data || { journeys: [], total: 0, page: page, limit: limit } as any;
        this.journeys = payload.journeys || [];
        this.total = payload.total || 0;
        this.page = payload.page || page;
        this.limit = payload.limit || limit;
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

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  createRange(n: number): any[] {
    return Array.from({ length: n });
  }

  getVisiblePages(): Array<number | '...'> {
    const totalPages = this.getTotalPages();
    const current = this.page;
    const edge = 2; 
    const around = 2; 

    if (totalPages <= 7 + (around * 2)) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: Array<number | '...'> = [];

    for (let i = 1; i <= edge; i++) pages.push(i);

    if (current - around > edge + 1) pages.push('...');

    const start = Math.max(edge + 1, current - around);
    const end = Math.min(totalPages - edge, current + around);
    for (let p = start; p <= end; p++) pages.push(p);

    if (current + around < totalPages - edge) pages.push('...');

    for (let i = totalPages - edge + 1; i <= totalPages; i++) pages.push(i);

    return pages;
  }

  setPage(p: number) {
    const totalPages = this.getTotalPages();
    if (p < 1 || p > totalPages) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: p, limit: this.limit },
      queryParamsHandling: 'merge'
    });
  }

  prevPage() {
    this.setPage(this.page - 1);
  }

  nextPage() {
    this.setPage(this.page + 1);
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
