import { Component } from '@angular/core';
import { FiltersFlightsComponent } from '../filters-flights/filters-flights.component';
import { ListFlightsComponent } from '../list-flights/list-flights.component';

@Component({
  selector: 'app-list-flights-page',
  imports: [
    FiltersFlightsComponent,
    ListFlightsComponent
  ],
  templateUrl: './list-flights-page.component.html',
  styleUrl: './list-flights-page.component.css'
})
export class ListFlightsPageComponent {

}
