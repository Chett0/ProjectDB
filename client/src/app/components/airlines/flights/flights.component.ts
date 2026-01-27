import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';
import { RoutesService } from '../../../services/airlines/routes.service';
import { AirlinesService } from '../../../services/airlines/airlines.service';
import { CreateFlight, Flight } from '../../../../types/flights/flights';
import { Response } from '../../../../types/responses/responses';
import { AircraftWithClasses, AirlineRoute } from '../../../../types/users/airlines';

export interface NewFlightData {
  departure_time: string;
  arrival_time: string;
  base_price: number;
}

@Component({
  selector: 'app-flights',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent implements OnInit {
  searchControl = new FormControl('');

  newFlight: NewFlightData = {
    departure_time: '',
    arrival_time: '',
    base_price: 0
  };
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  showAddFlightModal = false;

  aircrafts: AircraftWithClasses[] = [];
  filteredAircrafts: AircraftWithClasses[] = [];
  selectedAircraftId: number | null = null;
  modalAircraftSearchControl = new FormControl('');
  showModalAircraftsDropdown = false;

  routes: AirlineRoute[] = [];
  modalFilteredRoutes: AirlineRoute[] = [];
  selectedRouteId: number | null = null;
  modalRouteSearchControl = new FormControl('');
  showModalRoutesDropdown = false;

  addLoading = false;
  addError = '';
  addSuccess: string | null = null;
  loading: boolean = false;

  minDate : string = '';

  constructor(private aircraftsService: AircraftsService, private routesService: RoutesService, private airlinesService: AirlinesService) {
    const now = new Date();
        // Formatta la data come YYYY-MM-DDTHH:MM (formato richiesto da datetime-local)
        const year = now.getFullYear();
        const month = ('0' + (now.getMonth() + 1)).slice(-2);
        const day = ('0' + now.getDate()).slice(-2);
        const hours = ('0' + now.getHours()).slice(-2);
        const minutes = ('0' + now.getMinutes()).slice(-2);

        this.minDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  addFlight() {
    this.addError = '';
    if (!this.selectedAircraftId) {
      this.addError = 'Seleziona un aereo per il volo.';
      return;
    }
    if (!this.selectedRouteId) {
      this.addError = 'Seleziona una rotta per il volo.';
      return;
    }
    if (!this.newFlight.departure_time || !this.newFlight.arrival_time) {
      this.addError = 'Inserisci data/ora di partenza e arrivo.';
      return;
    }
    this.addLoading = true;

    const newFlight : CreateFlight = {
      routeId: this.selectedRouteId,
      aircraftId: this.selectedAircraftId,
      departureTime: new Date(this.newFlight.departure_time).toISOString(),
      arrivalTime: new Date(this.newFlight.arrival_time).toISOString(),
      basePrice: Number(this.newFlight.base_price)
    };

    this.airlinesService.createFlight(newFlight).subscribe({
      next: (res : Response<Flight>) => {
            if(res.success){
            this.addSuccess = 'Volo creato con successo.';
            setTimeout(() => this.addSuccess = null, 4000);
            this.addLoading = false;
            this.resetNewFlight();
            this.closeAddFlightModal();
            this.flights.push(res.data!);
            this.applySearch(String(this.searchControl.value || '').trim().toLowerCase());
          }
      },
      error: (err) => {
        this.addError = 'Errore nella creazione del volo.';
        this.addLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.modalAircraftSearchControl.valueChanges.subscribe(value => {
      this.applyAircraftsModalFilter(String(value || '').trim().toLowerCase());
    });
    this.modalRouteSearchControl.valueChanges.subscribe(value => {
      this.applyRoutesModalFilter(String(value || '').trim().toLowerCase());
    });

    this.aircraftsService.getAircrafts().subscribe({
      next: (res: Response<AircraftWithClasses[]>) => {
        if(res.success){
          this.aircrafts = res.data || [];
          this.applyAircraftsModalFilter(String(this.modalAircraftSearchControl.value || '').trim().toLowerCase())
        }
      },
      error: (err) => {
          this.aircrafts = [];
          this.filteredAircrafts = [];
      }
    });

    this.routesService.getRoutes().subscribe({
      next: (res: Response<AirlineRoute[]>) => {
        if(res.success){
          this.routes = res.data || [];
          this.applyRoutesModalFilter(String(this.modalRouteSearchControl.value || '').trim().toLowerCase());
        }
      },
      error: (err) => {
        this.routes = [];
      }
    });

    // load flights for this airline
    this.loadFlights();

    // wire search control to filter in realtime
    this.searchControl.valueChanges.subscribe(val => {
      this.applySearch(String(val || '').trim().toLowerCase());
    });
  }

  loadFlights() {
    this.loading = true;
    this.airlinesService.getAirlinesFlights().subscribe({
      next: (res: Response<Flight[]>) => {
        this.flights = res.data || [];
        this.applySearch(String(this.searchControl.value || '').trim().toLowerCase());
        this.loading = false;
      },
      error: (err) => {
        this.flights = [];
        this.loading = false;
      }
    });
  }

  applySearch(filter: string) {
    if (!filter) {
      this.filteredFlights = this.flights.slice();
      return;
    }
    const f = filter.toLowerCase();
    this.filteredFlights = this.flights.filter((flt: any) => {
      const depName = (flt.route?.departure_airport?.name || flt.departure_airport?.name || flt.route?.departure_airport?.city || flt.departure_airport?.city || '').toLowerCase();
      const arrName = (flt.route?.arrival_airport?.name || flt.arrival_airport?.name || flt.route?.arrival_airport?.city || flt.arrival_airport?.city || '').toLowerCase();
      const depCode = (flt.route?.departure_airport?.code || flt.departure_airport_code || '').toLowerCase();
      const arrCode = (flt.route?.arrival_airport?.code || flt.arrival_airport_code || '').toLowerCase();
      const aircraft = (flt.aircraft?.model || flt.aircraft_model || '').toLowerCase();
      const price = String(flt.base_price || '').toLowerCase();
      return depName.includes(f) || arrName.includes(f) || depCode.includes(f) || arrCode.includes(f) || aircraft.includes(f) || price.includes(f);
    });
  }


  formatFlightTime(dt: string | null | undefined) {
    if (!dt) return '-';
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return dt;
      return d.toLocaleString();
    } catch (e) {
      return dt;
    }
  }

  applyAircraftsModalFilter(filter: string) {
    if (!filter) {
      this.filteredAircrafts = this.aircrafts.slice();
      return;
    }
    this.filteredAircrafts = this.aircrafts.filter(a => {
      const model = (a.model || '').toLowerCase();
      const seats = String(a.nSeats || '');
      return model.includes(filter) || seats.includes(filter);
    });
  }

  applyRoutesModalFilter(filter: string) {
    if (!filter) {
      this.modalFilteredRoutes = this.routes.slice();
      return;
    }
    this.modalFilteredRoutes = this.routes.filter(r => {
      const dep = (r.departureAirport.code || '').toLowerCase();
      const arr = (r.arrivalAirport.code || '').toLowerCase();
      return dep.includes(filter) || arr.includes(filter);
    });
  }

  selectRoute(id: number) {
    this.selectedRouteId = id;
  }

  toggleModalRoutesDropdown() {
    this.showModalRoutesDropdown = !this.showModalRoutesDropdown;
  }

  get selectedRouteLabel(): string | null {
    if (this.selectedRouteId == null) return null;
    const found = this.routes.find(r => r.id === this.selectedRouteId);
    if (!found) return null;
    return `${found.departureAirport.code} → ${found.arrivalAirport.code}`;
  }

  selectAircraft(id: number) {
    this.selectedAircraftId = id;
  }

  toggleModalAircraftsDropdown() {
    this.showModalAircraftsDropdown = !this.showModalAircraftsDropdown;
  }

  get selectedAircraftModel(): string | null {
    if (this.selectedAircraftId == null) return null;
    const found = this.aircrafts.find(a => a.id === this.selectedAircraftId);
    return found ? found.model : null;
  }

  openAddFlightModal() {
    this.showAddFlightModal = true;
  }

  closeAddFlightModal() {
    this.showAddFlightModal = false;
    this.resetNewFlight();
    this.selectedAircraftId = null;
    this.selectedRouteId = null;
    this.modalAircraftSearchControl.setValue('');
    this.modalRouteSearchControl.setValue('');
    this.filteredAircrafts = this.aircrafts.slice();
    this.modalFilteredRoutes = this.routes.slice();
    this.showModalAircraftsDropdown = false;
    this.showModalRoutesDropdown = false;
  }

  resetNewFlight() {
    this.newFlight = {
      departure_time: '',
      arrival_time: '',
      base_price: 0
    };
  }

  onAddFlightSubmit() {
    this.addFlight();
    if(this.addError === '')
      this.closeAddFlightModal();
  }
}
