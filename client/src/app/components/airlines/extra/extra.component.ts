import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AirlinesService } from '../../../services/airlines/airlines.service';

@Component({
  selector: 'app-extra',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extra.component.html',
  styleUrl: './extra.component.css'
})
export class ExtraComponent {
  searchControl = new FormControl('');
  showAddModal = false;
  addExtraForm = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')])
  });
  submitting = false;
  extras: { name: string; price: number; id?: number }[] = [];
  filteredExtras: { name: string; price: number; id?: number }[] = [];
  loading = false;
  error: string | null = null;

  constructor(private airlinesService: AirlinesService) {
    this.fetchExtras();
    this.searchControl.valueChanges.subscribe((search) => {
      this.applySearch(search ?? '');
    });
  }

  fetchExtras() {
    this.loading = true;
    this.airlinesService.getExtras().subscribe({
      next: (res) => {
        this.extras = res.extras || [];
        this.applySearch(this.searchControl.value ?? '');
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore caricamento extra';
        this.loading = false;
      }
    });
  }

  applySearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredExtras = [...this.extras];
      return;
    }
    this.filteredExtras = this.extras.filter(e =>
      e.name.toLowerCase().includes(q) ||
      ('' + e.price).includes(q)
    );
  }

  addExtra() {
    if (this.addExtraForm.invalid) return;
    this.submitting = true;
    const { name, price } = this.addExtraForm.value;
    this.airlinesService.createExtra({ name: name ?? '', price: Number(price) }).subscribe({
      next: () => {
        this.submitting = false;
        this.showAddModal = false;
        this.addExtraForm.reset();
        this.fetchExtras();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  deleteExtra(extra: { name: string; price: number; id?: number }) {
    if (!extra.id) return;
    this.airlinesService.deleteExtra(extra.id).subscribe({
      next: () => this.fetchExtras(),
      error: () => { this.error = 'Errore eliminazione extra'; }
    });
  }
}

