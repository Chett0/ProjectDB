import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltersFlightsComponent } from '../../flights/filters-flights/filters-flights.component';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';
import { RoutesService } from '../../../services/airlines/routes.service';
import { AirlinesService } from '../../../services/airlines/airlines.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  imports: [ReactiveFormsModule, FormsModule, CommonModule, FiltersFlightsComponent],
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

  public flightsTotal: number = 0;
  public flightsPage: number = 1;
  public flightsLimit: number = 6;
  showAddFlightModal = false;
  showFilters: boolean = false;
  filters: { maxPrice: number; nStops: number; sortBy: string; order: string } = { maxPrice: 2000, nStops: 1, sortBy: 'total_duration', order: 'asc' };

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

  constructor(private aircraftsService: AircraftsService, private routesService: RoutesService, private airlinesService: AirlinesService, private route: ActivatedRoute, private router: Router) {
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

    //use prefetch data if available
    //aircrafts
    this.route.data.subscribe(({ airlineData }) => {
      if (airlineData) {
        if (airlineData.aircraftsResponse && airlineData.aircraftsResponse.success) {
          this.aircrafts = airlineData.aircraftsResponse.data || [];
          this.applyAircraftsModalFilter(String(this.modalAircraftSearchControl.value || '').trim().toLowerCase());
        } else {
          this.aircraftsService.getAircrafts().subscribe({
            next: (res: Response<AircraftWithClasses[]>) => {
              if(res.success){
                this.aircrafts = res.data || [];
                this.applyAircraftsModalFilter(String(this.modalAircraftSearchControl.value || '').trim().toLowerCase())
              }
            },
            error: () => { this.aircrafts = []; this.filteredAircrafts = []; }
          });
        }

        //routes
        if (airlineData.routesResponse && airlineData.routesResponse.success) {
          this.routes = airlineData.routesResponse.data || [];
          this.applyRoutesModalFilter(String(this.modalRouteSearchControl.value || '').trim().toLowerCase());
        } else {
          this.routesService.getRoutes().subscribe({
            next: (res: Response<AirlineRoute[]>) => {
              if(res.success){
                this.routes = res.data || [];
                this.applyRoutesModalFilter(String(this.modalRouteSearchControl.value || '').trim().toLowerCase());
              }
            },
            error: () => { this.routes = []; }
          });
        }


        //flights
        if (airlineData.flightsResponse) {
          const payload = airlineData.flightsResponse?.data ? airlineData.flightsResponse.data : airlineData.flightsResponse;
          this.flights = payload?.flights || [];
          this.flightsTotal = payload?.total || 0;
          this.flightsPage = payload?.page || this.flightsPage;
          this.flightsLimit = payload?.limit || this.flightsLimit;
          this.applyCombinedFilters(String(this.searchControl.value || '').trim().toLowerCase());
          this.loading = false;
        } else {
          this.loadFlights(this.flightsPage);
        }

      } else {
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

        this.loadFlights(this.flightsPage);
      }
    });

    this.searchControl.valueChanges.subscribe(val => {
      const q = String(val || '').trim();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: q ? { q } : { q: null },
        queryParamsHandling: 'merge'
      });
      this.applyCombinedFilters(String(q).toLowerCase());
    });

    // react to filters applied via query params (from FiltersFlightsComponent)
    // reload flights from server when filters change so filtering is applied across all pages
    this.route.queryParams.subscribe(() => {
      this.loadFlights(1);
    });
  }

  loadFlights(page: number = 1) {
    this.loading = true;
    this.flightsPage = page;

    const qp = this.route.snapshot.queryParams;
    const filters: { q?: string; maxPrice?: number; sortBy?: string; order?: string } = {};
    if (qp['q']) filters.q = String(qp['q']);
    if (qp['maxPrice'] !== undefined) filters.maxPrice = Number(qp['maxPrice']);
    if (qp['sortBy']) filters.sortBy = String(qp['sortBy']);
    if (qp['order']) filters.order = String(qp['order']);

    this.airlinesService.getAirlinesFlights(this.flightsPage, this.flightsLimit, filters).subscribe({
      next: (res: any) => {
        const payload = res?.data ? res.data : res;
        this.flights = payload?.flights || [];
        this.flightsTotal = payload?.total || 0;
        this.flightsPage = payload?.page || this.flightsPage;
        this.flightsLimit = payload?.limit || this.flightsLimit;
        this.applyCombinedFilters(String(this.searchControl.value || '').trim().toLowerCase());
        this.loading = false;
      },
      error: (err) => {
        this.flights = [];
        this.flightsTotal = 0;
        this.loading = false;
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  private applyCombinedFilters(textFilter: string) {
    const f = String(textFilter || '').trim().toLowerCase();

    let result = this.flights.slice();

    if (f) {
      result = result.filter((flt: any) => {
        const depName = (flt.departureAirport?.name || flt.departureAirport?.city || '').toLowerCase();
        const arrName = (flt.arrivalAirport?.name || flt.arrivalAirport?.city || '').toLowerCase();
        const depCode = (flt.departureAirport?.code || '').toLowerCase();
        const arrCode = (flt.arrivalAirport?.code || '').toLowerCase();
        const aircraft = (flt.aircraft?.model || '').toLowerCase();
        const price = String(flt.basePrice || flt.base_price || '').toLowerCase();
        return depName.includes(f) || arrName.includes(f) || depCode.includes(f) || arrCode.includes(f) || aircraft.includes(f) || price.includes(f);
      });
    }

    const qp = this.route.snapshot.queryParams;
    this.filters.maxPrice = qp['maxPrice'] !== undefined ? Number(qp['maxPrice']) : this.filters.maxPrice;
    this.filters.nStops = qp['nStops'] !== undefined ? Number(qp['nStops']) : this.filters.nStops;
    this.filters.sortBy = qp['sortBy'] || this.filters.sortBy;
    this.filters.order = qp['order'] || this.filters.order;

    if (this.filters.maxPrice !== undefined && !isNaN(this.filters.maxPrice)) {
      result = result.filter((flt: any) => {
        const price = Number(flt.basePrice ?? flt.base_price ?? 0);
        return price <= this.filters.maxPrice;
      });
    }


    const order = this.filters.order === 'desc' ? -1 : 1;
    const sortBy = this.filters.sortBy || 'departure_time';
    result.sort((a: any, b: any) => {
      if (sortBy === 'total_price' || sortBy === 'base_price') {
        const pa = Number(a.basePrice ?? a.base_price ?? 0);
        const pb = Number(b.basePrice ?? b.base_price ?? 0);
        return (pa - pb) * order;
      }
      if (sortBy === 'departure_time' || sortBy === 'departureTime') {
        const da = new Date(a.departureTime ?? a.departure_time).getTime();
        const db = new Date(b.departureTime ?? b.departure_time).getTime();
        return (da - db) * order;
      }
      if (sortBy === 'arrival_time' || sortBy === 'arrivalTime') {
        const da = new Date(a.arrivalTime ?? a.arrival_time).getTime();
        const db = new Date(b.arrivalTime ?? b.arrival_time).getTime();
        return (da - db) * order;
      }
      // total_duration fallback: compute duration
      const dura = (fl: any) => {
        const d1 = new Date(fl.departureTime ?? fl.departure_time).getTime();
        const d2 = new Date(fl.arrivalTime ?? fl.arrival_time).getTime();
        return Math.max(0, d2 - d1);
      };
      return (dura(a) - dura(b)) * order;
    });

    this.filteredFlights = result;
  }

  getFlightsTotalPages(): number {
    return Math.max(1, Math.ceil(this.flightsTotal / this.flightsLimit));
  }


  getVisibleFlightPages(): Array<number | '...'> {
    const totalPages = this.getFlightsTotalPages();
    const current = this.flightsPage;
    const edge = 1;
    const around = 1;

    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [];
    for (let i = 1; i <= edge; i++) pages.push(i);
    if (current - around > edge + 1) pages.push('...');
    const start = Math.max(edge + 1, current - around);
    const end = Math.min(totalPages - edge, current + around);
    for (let p = start; p <= end; p++) pages.push(p);
    if (current + around < totalPages - edge) pages.push('...');
    for (let i = totalPages - edge + 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  setFlightsPage(p: number) {
    const totalPages = this.getFlightsTotalPages();
    if (p < 1 || p > totalPages) return;
    this.loadFlights(p);
  }

  prevFlightsPage() { this.setFlightsPage(this.flightsPage - 1); }
  nextFlightsPage() { this.setFlightsPage(this.flightsPage + 1); }

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
