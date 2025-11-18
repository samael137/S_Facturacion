import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFactura } from './crear-factura';

describe('CrearFactura', () => {
  let component: CrearFactura;
  let fixture: ComponentFixture<CrearFactura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFactura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFactura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
