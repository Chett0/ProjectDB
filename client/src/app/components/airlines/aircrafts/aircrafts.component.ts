import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AircraftsService } from '../../../services/airlines/aircrafts.service';
import { Response } from '../../../../types/responses/responses';
import { AircraftWithClasses, Class, ClassInfo, CreateAircraft } from '../../../../types/users/airlines';

@Component({
  selector: 'app-aircrafts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './aircrafts.component.html',
  styleUrls: ['./aircrafts.component.css']
})
export class AircraftsComponent implements OnInit {
  tab: 'list' | 'add' = 'list';
  aircrafts: AircraftWithClasses[] = [];
  loading = false;
  error = '';

  searchControl = new FormControl('');
  filteredAircrafts: AircraftWithClasses[] = [];

  // Form fields
  newModel = '';
  newSeats = '';
  classes: ClassInfo[] = [];
  addLoading = false;
  addError = '';
  addSuccess: string | null = null;
  showAddModal = false;

  constructor(private aircraftsService: AircraftsService, private route: ActivatedRoute) {}

  ngOnInit() {
    
    //prefetch aircrafts
    this.route.data.subscribe(({ airlineData }) => {
      if (airlineData && airlineData.aircraftsResponse && airlineData.aircraftsResponse.success) {
        this.aircrafts = airlineData.aircraftsResponse.data || [];
        this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
        this.loading = false;
      } else {
        this.fetchAircrafts();
      }
    });

    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(String(value || '').trim().toLowerCase());
    });
  }

  fetchAircrafts() {
  this.loading = true;
  this.error = '';
  this.aircraftsService.getAircrafts().subscribe({
      next: (res: Response<AircraftWithClasses[]>) => {
        if(res.success){
          this.aircrafts = res.data || [];
          this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
        }
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

     if(Number(this.newSeats) <= 0){
      this.addError = "Un aereo deve avere almeno 1 posto";
      return;
    }

    for (const c of this.classes) {
      if (!c.name || !c.nSeats || !c.priceMultiplier) {
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
    const newAircraft : CreateAircraft = {
      model: this.newModel,
      nSeats: Number(this.newSeats),
      classes: this.classes
    };

    this.aircraftsService.addAircraft(newAircraft).subscribe({
      next: (res: Response<AircraftWithClasses>) => {
        if (res.success && res.data) {
          this.addSuccess = 'Aereo aggiunto con successo.';
          this.aircrafts = [...this.aircrafts, res.data]; // recreate the array to show new aircraft added

          const currentFilter = (this.searchControl.value || '').trim().toLocaleLowerCase();
          this.applyFilter(currentFilter);

          setTimeout(() => {
            this.closeAddModal();
          }, 500);
        } else {
          this.addError = 'Errore durante l\'aggiunta.';
          this.addLoading = false;
        }
      },
      error: () => {
        this.addError = 'Errore durante l\'aggiunta.';
        this.addLoading = false;
      }
    });
  }

  addClass() {
    if (this.classes.length >= 4) return;
    this.classes.push({ name: '', nSeats: 0, priceMultiplier: 0 });
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

  deleteAircraft(aircraft: AircraftWithClasses) {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare l'aereo: ${aircraft.model} (ID ${aircraft.id})?`);
    if (!confirmed) return;

  this.aircraftsService.deleteAircraft(aircraft.id).subscribe({
      next: (res : Response<void>) => {
        if(res.success){
          this.aircrafts = this.aircrafts.filter(a => a.id !== aircraft.id);
          this.applyFilter((this.searchControl.value || '').trim().toLowerCase());
        }
      },
      error: () => {
        this.error = "Errore durante l'eliminazione dell'aereo.";
      }
    });
  }
}
