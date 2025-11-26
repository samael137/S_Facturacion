import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCliente } from './detalle-cliente';

describe('DetalleCliente', () => {
  let component: DetalleCliente;
  let fixture: ComponentFixture<DetalleCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
