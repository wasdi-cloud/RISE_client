import { TestBed } from '@angular/core/testing';

import { MapParametersService } from './map-parameters.service';

describe('MapParametersService', () => {
  let service: MapParametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
