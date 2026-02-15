import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExtrasService } from '../../../services/airlines/extras.service';
import { ActivatedRoute } from '@angular/router';
import { Extra } from '../../../../types/users/airlines';
import { Response } from '../../../../types/responses/responses';

@Component({
  selector: 'app-extra',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extra.component.html',
  styleUrl: './extra.component.css'
})
export class ExtraComponent implements OnInit {
  searchControl = new FormControl('');
  showAddModal = false;
  addExtraForm = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')])
  });
  submitting = false;
  extras: Extra[] = [];
  filteredExtras: Extra[] = [];
  loading = false;
  error: string | null = null;

  constructor(private extrasService: ExtrasService, private route: ActivatedRoute) {
    this.searchControl.valueChanges.subscribe(() => {
      this.applySearch();
    });
  }

  ngOnInit(): void {
    // prefetch extras
    this.route.data.subscribe(({ airlineData }) => {
      if (airlineData && airlineData.extrasResponse && airlineData.extrasResponse.success) {
        this.extras = airlineData.extrasResponse.data || [];
        this.applySearch();
        this.loading = false;
      } else {
        this.fetchExtras();
      }
    });
  }


  fetchExtras() {
    this.loading = true;
    this.extrasService.getExtras().subscribe({
      next: (res : Response<Extra[]>) => {
        this.extras = res.data || [];
        this.applySearch();
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore caricamento extra';
        this.loading = false;
      }
    });
  }

  applySearch() {
    const q = this.searchControl.value ? this.searchControl.value.trim().toLowerCase() : null;
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
    this.extrasService.createExtra({ 
      name: name ?? '', 
      price: Number(price) 
    }).subscribe({
      next: (res : Response<Extra>) => {
        this.submitting = false;
        if(!res.success || !res.data){
          this.error = 'Errore aggiunta extra';
          return;
        }
        this.showAddModal = false;
        this.addExtraForm.reset();
        this.extras.push(res.data);
        this.applySearch();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  deleteExtra(extra: Extra) {
    if (!extra.id) return;
    this.extrasService.deleteExtra(extra.id).subscribe({
      next: (res : Response<void>) => {
        if(!res.success){
          this.error = 'Errore eliminazione extra'; 
          return;
        }
        this.extras = this.extras.filter(e => e.id !== extra.id);
        this.applySearch();
      },
      error: () => { 
        this.error = 'Errore eliminazione extra'; 
      }
    });
  }
}

