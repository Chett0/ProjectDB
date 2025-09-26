import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFlightsPageComponent } from './list-flights-page.component';

describe('ListFlightsPageComponent', () => {
  let component: ListFlightsPageComponent;
  let fixture: ComponentFixture<ListFlightsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFlightsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFlightsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
