import { TestBed } from '@angular/core/testing';

import { AircraftsService } from './aircrafts.service';

describe('AircraftsService', () => {
  let service: AircraftsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AircraftsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
