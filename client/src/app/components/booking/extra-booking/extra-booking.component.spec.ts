import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtraBookingComponent } from './extra-booking.component';

describe('ExtraBookingComponent', () => {
  let component: ExtraBookingComponent;
  let fixture: ComponentFixture<ExtraBookingComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
