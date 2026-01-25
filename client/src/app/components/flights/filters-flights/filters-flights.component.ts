import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Filters } from '../../../../types/flights/flights';

@Component({
  selector: 'app-filters-flights',
  imports: [FormsModule],
  templateUrl: './filters-flights.component.html',
  styleUrl: './filters-flights.component.css'
})
export class FiltersFlightsComponent implements OnInit{

  filters! : Filters;
  private maxPrice : number = 2000;

  constructor(
    private route : ActivatedRoute,
    private router : Router
  ){}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const params_nStop : string | undefined = params['nStop']
      const params_maxPrice : string | undefined = params['maxPrice']

      
      const params_sortBy = params['sortBy'] === undefined ? 'total_duration' : params['sortBy'];
      const params_order = params['order'] === undefined ? 'asc' : params['order'];
      

      

    this.filters = {
      maxPrice : params_maxPrice == undefined ? this.maxPrice : parseInt(params_maxPrice),
      nStop : params_nStop == undefined ? 1 : parseInt(params_nStop),
      sortBy : params_sortBy,
      order: params_order
    }
  })
}



  applyFilters() {
    this.router.navigate([], { 
      relativeTo: this.route,
    queryParams: this.filters,
    queryParamsHandling: 'merge'
    });
  }

  isNonStopChecked(): boolean {
    return this.filters.nStop === 0;
  }

  toggleNonStop(): void {
    this.filters.nStop = this.filters.nStop === 1 ? 0 : 1;
  }
  

}
