import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersFlightsComponent } from './filters-flights.component';

describe('FiltersFlightsComponent', () => {
  let component: FiltersFlightsComponent;
  let fixture: ComponentFixture<FiltersFlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersFlightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersFlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
