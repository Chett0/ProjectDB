import { Component, OnInit } from '@angular/core';
import { AirlinesService } from '../../../services/airlines/airlines.service';
import { Aircraft, Route, RouteAirport } from '../../../../types/users/airlines';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-routes',
  imports: [ReactiveFormsModule],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css'
})
export class RoutesComponent implements OnInit{

  constructor(private airlinesService : AirlinesService, private router : Router, private route : ActivatedRoute) {}

  routes : RouteAirport[] = []
  addRouteForm = new FormGroup({
    departure_airport : new FormControl(''),
    arrival_airport : new FormControl('')
  })

  ngOnInit(): void {
    this.airlinesService.getRoutes().subscribe({
        next: response => {
          this.routes = response.routes;
          console.log(this.routes);
        },
        error: (err) => {
          console.error(err);
        }
    });
  }


  addRoute() {
    const newRoute : Route = {
      departure_airport_code : this.addRouteForm.value.departure_airport!,
      arrival_airport_code : this.addRouteForm.value.arrival_airport!
    }
    this.airlinesService.addRoute(newRoute).subscribe({
        next: response => {
          console.log(response)
        },
        error: (err) => {
          console.error(err);
        }
    });
  }

  deleteRoute(id : number){
    this.airlinesService.deleteRoute(id).subscribe({
        next: response => {
          console.log(response)
        },
        error: (err) => {
          console.error(err);
        }
    });
  }
  


}
