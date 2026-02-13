import { Component } from '@angular/core';
import { ListFlightsComponent } from '../list-flights/list-flights.component';

@Component({
  selector: 'app-list-flights-page',
  imports: [
    ListFlightsComponent
  ],
  templateUrl: './list-flights-page.component.html',
  styleUrl: './list-flights-page.component.css'
})
export class ListFlightsPageComponent {

}
