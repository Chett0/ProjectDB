import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFlightsComponent } from './list-flights.component';

describe('ListComponent', () => {
  let component: ListFlightsComponent;
  let fixture: ComponentFixture<ListFlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFlightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
