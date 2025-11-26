import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFactura } from './editar-factura';

describe('EditarFactura', () => {
  let component: EditarFactura;
  let fixture: ComponentFixture<EditarFactura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFactura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFactura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
