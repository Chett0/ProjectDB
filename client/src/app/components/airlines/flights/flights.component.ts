import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';
import { RoutesService } from '../../../services/airlines/routes.service';
import { AirlinesService } from '../../../services/airlines/airlines.service';

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

  showAddFlightModal = false;
  newFlight: NewFlightData = {
    departure_time: '',
    arrival_time: '',
    base_price: 0
  };

  aircraftsCompact: { id: number; model: string; nSeats: number }[] = [];
  selectedAircraftId: number | null = null;
  modalAircraftSearchControl = new FormControl('');
  modalFilteredAircrafts: { id: number; model: string; nSeats: number }[] = [];
  showModalAircraftsDropdown = false;
  routesCompact: { id: number; departure_airport_code: string; arrival_airport_code: string; name?: string; departure_airport?: any; arrival_airport?: any }[] = [];
  selectedRouteId: number | null = null;
  modalRouteSearchControl = new FormControl('');
  modalFilteredRoutes: { id: number; departure_airport_code: string; arrival_airport_code: string; name?: string; departure_airport?: any; arrival_airport?: any }[] = [];
  showModalRoutesDropdown = false;
  addLoading = false;
  addError = '';
  addSuccess: string | null = null;
  loading: boolean = false;
  flights: any[] = [];
  filteredFlights: any[] = [];

  constructor(private aircraftsService: AircraftsService, private routesService: RoutesService, private airlinesService: AirlinesService) {}
  
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

    // Convert datetime-local (ISO-like) to backend format "%Y-%m-%d %H:%M"
    const toBackendFormat = (iso: string) => {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    const payload = {
      route_id: this.selectedRouteId,
      aircraft_id: this.selectedAircraftId,
      departure_time: toBackendFormat(this.newFlight.departure_time),
      arrival_time: toBackendFormat(this.newFlight.arrival_time),
      base_price: Number(this.newFlight.base_price)
    };

    this.airlinesService.createFlight(payload).subscribe({
      next: () => {
        this.addSuccess = 'Volo creato con successo.';
        setTimeout(() => this.addSuccess = null, 4000);
        this.addLoading = false;
        this.resetNewFlight();
        this.closeAddFlightModal();
        this.loadFlights();
      },
      error: (err) => {
        this.addError = 'Errore nella creazione del volo.';
        this.addLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.modalAircraftSearchControl.valueChanges.subscribe(value => {
      this.applyModalFilter(String(value || '').trim().toLowerCase());
    });
    this.modalRouteSearchControl.valueChanges.subscribe(value => {
      this.applyRouteModalFilter(String(value || '').trim().toLowerCase());
    });

    this.aircraftsService.getAircrafts().subscribe(data => {
      const list = Array.isArray(data) ? data : (data as any)?.aircrafts ?? [];
      if (list && list.length) {
        this.aircraftsCompact = list.map((a: any) => ({ id: (a as any).id ?? -1, model: a.model, nSeats: a.nSeats }));
        this.modalFilteredAircrafts = this.aircraftsCompact.slice();
      }
    });

    this.routesService.getRoutes().subscribe(data => {
      const list = Array.isArray(data) ? data : (data as any)?.routes ?? [];
      if (list && list.length) {
        this.routesCompact = list.map((r: any) => {
          const id = (r as any).id ?? -1;
          const depCode = r.departure_airport_code || r.departure_airport?.code || '';
          const arrCode = r.arrival_airport_code || r.arrival_airport?.code || '';
          const depName = r.departure_airport?.name || r.departure_airport?.city || '';
          const arrName = r.arrival_airport?.name || r.arrival_airport?.city || '';
          const name = depName && arrName ? `${depName} → ${arrName}` : undefined;
          return { id, departure_airport_code: depCode, arrival_airport_code: arrCode, name, departure_airport: r.departure_airport, arrival_airport: r.arrival_airport };
        });
        this.modalFilteredRoutes = this.routesCompact.slice();
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
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res && (res.flights || res.data)) ? (res.flights || res.data) : [];
        this.flights = Array.isArray(list) ? list : [];
        this.applySearch(String(this.searchControl.value || '').trim().toLowerCase());
        this.loading = false;
      },
      error: (err) => {
        console.warn('Could not load flights', err);
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

  applyModalFilter(filter: string) {
    if (!filter) {
      this.modalFilteredAircrafts = this.aircraftsCompact.slice();
      return;
    }
    this.modalFilteredAircrafts = this.aircraftsCompact.filter(a => {
      const model = (a.model || '').toLowerCase();
      const seats = String(a.nSeats || '');
      return model.includes(filter) || seats.includes(filter);
    });
  }

  applyRouteModalFilter(filter: string) {
    if (!filter) {
      this.modalFilteredRoutes = this.routesCompact.slice();
      return;
    }
    this.modalFilteredRoutes = this.routesCompact.filter(r => {
      const dep = (r.departure_airport_code || '').toLowerCase();
      const arr = (r.arrival_airport_code || '').toLowerCase();
      const name = (r.name || '').toLowerCase();
      return dep.includes(filter) || arr.includes(filter) || name.includes(filter);
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
    const found = this.routesCompact.find(r => r.id === this.selectedRouteId);
    if (!found) return null;
    return found.name ? `${found.name} (${found.departure_airport_code} → ${found.arrival_airport_code})` : `${found.departure_airport_code} → ${found.arrival_airport_code}`;
  }

  selectAircraft(id: number) {
    this.selectedAircraftId = id;
  }

  toggleModalAircraftsDropdown() {
    this.showModalAircraftsDropdown = !this.showModalAircraftsDropdown;
  }

  get selectedAircraftModel(): string | null {
    if (this.selectedAircraftId == null) return null;
    const found = this.aircraftsCompact.find(a => a.id === this.selectedAircraftId);
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
    this.modalFilteredAircrafts = this.aircraftsCompact.slice();
    this.modalFilteredRoutes = this.routesCompact.slice();
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
    this.closeAddFlightModal();
  }
}
