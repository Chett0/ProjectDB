import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Filters {
  maxPrice: number,
  nStop: number;
  sort: {
    sort_by: 'price' | 'total_duration' | 'departure_time';
    order: 'asc' | 'desc';
  };
}

@Component({
  selector: 'app-filters',
  imports: [FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent implements OnInit{

  
  filters! : Filters;
  
  ngOnInit(): void {
    this.filters = {
      maxPrice : 10000,
      nStop : 1,
      sort : {
        sort_by : 'total_duration',
        order: 'asc'
      }
    }
  }
  

}
