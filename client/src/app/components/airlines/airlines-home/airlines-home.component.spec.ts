import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlinesHomeComponent } from './airlines-home.component';

describe('AirlinesHomeComponent', () => {
  let component: AirlinesHomeComponent;
  let fixture: ComponentFixture<AirlinesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlinesHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlinesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
