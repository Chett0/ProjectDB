import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { SearchFlightsComponent } from './components/search-flights/search-flights.component';
import { LoginComponent } from "./components/auth/login/login.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';


  // constructor(private route : ActivatedRoute) {}
}
