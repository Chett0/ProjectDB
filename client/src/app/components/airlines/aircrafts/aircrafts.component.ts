import { Component, OnInit } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';

@Component({
  selector: 'app-aircrafts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './aircrafts.component.html',
  styleUrls: ['./aircrafts.component.css']
})
export class AircraftsComponent implements OnInit {
  tab: 'list' | 'add' = 'list';
  aircrafts: any[] = [];
  loading = false;
  error = '';

  searchControl = new FormControl('');
  filteredAircrafts: any[] = [];

  // Form fields
  newModel = '';
  newSeats = '';
  classes: { name: string; nSeats: number | null; price_multiplier: number | null }[] = [];
  addLoading = false;
  addError = '';
  addSuccess: string | null = null;
  showAddModal = false;

  constructor(private aircraftsService: AircraftsService) {}

  ngOnInit() {
  this.fetchAircrafts();
    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(String(value || '').trim().toLowerCase());
    });
  }

  fetchAircrafts() {
    this.loading = true;
    this.error = '';
  this.aircraftsService.getAircrafts().subscribe({
      next: (data: any) => {
        // The backend sometimes returns an object { message, aircrafts: [...] }
        // Normalize to always have an array to avoid runtime errors.
        const list = Array.isArray(data) ? data : (data?.aircrafts ?? []);
        this.aircrafts = list;
        this.filteredAircrafts = this.aircrafts.slice();
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento degli aerei.';
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.showAddModal = true;
  }
  closeAddModal() {
    this.showAddModal = false;
    this.addError = '';
    this.addSuccess = null;
    this.newModel = '';
    this.newSeats = '';
    this.classes = [];
    this.addLoading = false;
  }

  addAircraft() {
    if (!this.newModel || !this.newSeats) {
      this.addError = 'Compila tutti i campi.';
      return;
    }
    for (const c of this.classes) {
      if (!c.name || !c.nSeats || !c.price_multiplier) {
        this.addError = 'Compila tutti i campi delle classi o rimuovi classi incomplete.';
        return;
      }
    }
    if (this.classes && this.classes.length) {
      const totalClassSeats = this.classes.reduce((sum, c) => sum + Number(c.nSeats || 0), 0);
      if (totalClassSeats !== Number(this.newSeats)) {
        this.addError = `La somma dei posti delle classi (${totalClassSeats}) deve corrispondere al numero totale di posti dell'aereo (${this.newSeats}).`;
        return;
      }
    }
    this.addLoading = true;
    this.addError = '';
    const payload: any = { model: this.newModel, nSeats: Number(this.newSeats) };
    if (this.classes && this.classes.length) payload.classes = this.classes.map(c => ({ name: c.name, nSeats: c.nSeats, price_multiplier: c.price_multiplier }));

  this.aircraftsService.addAircraft(payload).subscribe({
      next: (res: any) => {
        this.addSuccess = 'Aereo aggiunto con successo.';
        setTimeout(() => this.addSuccess = null, 4000);
        this.addLoading = false;
        this.closeAddModal();
        this.fetchAircrafts();
      },
      error: () => {
        this.addError = 'Errore durante l\'aggiunta.';
        this.addLoading = false;
      }
    });
  }

  addClass() {
    if (this.classes.length >= 4) return;
    this.classes.push({ name: '', nSeats: null, price_multiplier: null });
  }

  removeClass(index: number) {
    if (index >= 0 && index < this.classes.length) this.classes.splice(index, 1);
  }


  applyFilter(filter: string) {
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

  deleteAircraft(aircraft: any) {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare l'aereo: ${aircraft.model} (ID ${aircraft.id})?`);
    if (!confirmed) return;

  this.aircraftsService.deleteAircraft(aircraft.id).subscribe({
      next: () => {
        this.aircrafts = this.aircrafts.filter(a => a.id !== aircraft.id);
        this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
      },
      error: () => {
        this.error = "Errore durante l'eliminazione dell'aereo.";
      }
    });
  }
}
