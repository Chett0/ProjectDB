import { Component } from '@angular/core';
import { FiltersComponent } from '../filters/filters.component';
import { ListFlightsComponent } from '../list-flights/list-flights.component';

@Component({
  selector: 'app-list-flights-page',
  imports: [
    FiltersComponent,
    ListFlightsComponent
  ],
  templateUrl: './list-flights-page.component.html',
  styleUrl: './list-flights-page.component.css'
})
export class ListFlightsPageComponent {

}
