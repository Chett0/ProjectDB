import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatsMapComponent } from './seats-map.component';

describe('SeatsMapComponent', () => {
  let component: SeatsMapComponent;
  let fixture: ComponentFixture<SeatsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatsMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
