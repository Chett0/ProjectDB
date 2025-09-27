import { TestBed } from '@angular/core/testing';
import { PassengersResolver } from './passengers.resolver';

describe('PassengersResolver', () => {
  let resolver: PassengersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PassengersResolver]
    });
    resolver = TestBed.inject(PassengersResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
