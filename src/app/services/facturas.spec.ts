import { TestBed } from '@angular/core/testing';

import { FacturasService } from './facturas';

describe('Facturas', () => {
  let service: FacturasService;

  beforeEach(() => {  
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
