import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flights',
  imports: [ReactiveFormsModule,  CommonModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent {
  searchControl = new FormControl('');
  showAddModal = false;
  addFlightForm = new FormGroup({});
  submitting = false;

  addFlight() {
    // Da implementare
  }
}
