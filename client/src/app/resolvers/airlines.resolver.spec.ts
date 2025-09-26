import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { airlinesResolver } from './airlines.resolver';

describe('airlinesResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => airlinesResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
