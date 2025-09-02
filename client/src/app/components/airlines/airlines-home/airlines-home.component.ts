import { Component, OnInit } from '@angular/core';
import { enviroment } from '../../../enviroments/enviroments';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AirlinesService } from '../../../services/airlines/airlines.service';


@Component({
  selector: 'app-airlines-home',
  imports: [RouterOutlet],
  templateUrl: './airlines-home.component.html',
  styleUrl: './airlines-home.component.css'
})
export class AirlinesHomeComponent implements OnInit{

  // homeRoute : string = '';
  aircraftsRoute : string = 'aircrafts';
  routesRoute : string = 'routes';

  constructor(private airlinesService : AirlinesService, private router : Router, private route : ActivatedRoute) {}

  ngOnInit(): void {
      this.airlinesService.getAircrafts().subscribe({})
  }

  navigateTo(route : string) {
    this.router.navigate([route], { relativeTo: this.route });
  }

}
