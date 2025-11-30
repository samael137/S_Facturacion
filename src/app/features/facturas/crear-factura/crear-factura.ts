import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FacturasService } from '../../../services/facturas';
import { ClientesService } from '../../../services/clientes';
import { Cliente } from '../../../models/cliente';
import { ItemFactura } from '../../../models/factura';

@Component({
  selector: 'app-crear-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-factura.html',
  styleUrl: './crear-factura.css'
})
export class CrearFactura implements OnInit {
  private fb = inject(FormBuilder);
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);
  private router = inject(Router);

  facturaForm: FormGroup;
  loading = false;
  loadingClientes = true;
  error = '';
  success = '';

  // Clientes disponibles
  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;

  // Lista de productos predefinidos (simulado)
  productosDisponibles = [
    { codigo: 'PROD001', nombre: 'Laptop HP', precio: 2500 },
    { codigo: 'PROD002', nombre: 'Mouse Logitech', precio: 45 },
    { codigo: 'PROD003', nombre: 'Teclado Mecánico', precio: 120 },
    { codigo: 'PROD004', nombre: 'Monitor 24"', precio: 350 },
    { codigo: 'PROD005', nombre: 'Webcam HD', precio: 85 },
    { codigo: 'PROD006', nombre: 'Audífonos Bluetooth', precio: 95 },
    { codigo: 'PROD007', nombre: 'SSD 1TB', precio: 180 },
    { codigo: 'PROD008', nombre: 'RAM 16GB', precio: 150 },
    { codigo: 'SERV001', nombre: 'Soporte Técnico', precio: 50 },
    { codigo: 'SERV002', nombre: 'Instalación Software', precio: 80 }
  ];

  constructor() {
    this.facturaForm = this.fb.group({
      clienteId: ['', Validators.required],
      fecha: [this.getFechaHoy(), Validators.required],
      fechaVencimiento: [this.getFechaVencimiento(), Validators.required],
      formaPago: ['efectivo', Validators.required],
      items: this.fb.array([]),
      descuento: [0, [Validators.min(0)]],
      notas: ['']
    });
  }

  async ngOnInit() {
    await this.cargarClientes();
    this.agregarItem(); // Agregar primera fila de item
  }

  async cargarClientes() {
    try {
      this.loadingClientes = true;
      this.clientes = await this.clientesService.obtenerTodos();
    } catch (error) {
      console.error('Error cargando clientes:', error);
      this.error = 'Error al cargar los clientes';
    } finally {
      this.loadingClientes = false;
    }
  }

  // FormArray de items
  get items(): FormArray {
    return this.facturaForm.get('items') as FormArray;
  }

  // Crear un nuevo item
  crearItem(): FormGroup {
    return this.fb.group({
      productoCodigo: ['', Validators.required],
      productoNombre: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      iva: [0],
      subtotal: [0],
      total: [0]
    });
  }

  // Agregar item
  agregarItem() {
    this.items.push(this.crearItem());
  }

  // Eliminar item
  eliminarItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calcularTotales();
    }
  }

  // Seleccionar producto predefinido
  seleccionarProducto(index: number, event: any) {
    const productoCodigo = event.target.value;
    const producto = this.productosDisponibles.find(p => p.codigo === productoCodigo);
    
    if (producto) {
      const item = this.items.at(index);
      item.patchValue({
        productoCodigo: producto.codigo,
        productoNombre: producto.nombre,
        precioUnitario: producto.precio
      });
      this.calcularItem(index);
    }
  }

  // Calcular valores de un item
  calcularItem(index: number) {
    const item = this.items.at(index);
    const cantidad = item.get('cantidad')?.value || 0;
    const precioUnitario = item.get('precioUnitario')?.value || 0;
    
    const subtotal = cantidad * precioUnitario;
    const iva = subtotal * 0.18; // IVA 18%
    const total = subtotal + iva;

    item.patchValue({
      iva: iva,
      subtotal: subtotal,
      total: total
    }, { emitEvent: false });

    this.calcularTotales();
  }

  // Calcular totales generales
  calcularTotales() {
    // Se calcula automáticamente en los getters
  }

  // Cliente seleccionado
  onClienteChange(event: any) {
    const clienteId = event.target.value;
    this.clienteSeleccionado = this.clientes.find(c => c.id === clienteId) || null;
  }

  // Obtener fecha de hoy
  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Obtener fecha de vencimiento (30 días)
  getFechaVencimiento(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().split('T')[0];
  }

  // Getters para totales
  get subtotalGeneral(): number {
    return this.items.controls.reduce((sum, item) => {
      return sum + (item.get('subtotal')?.value || 0);
    }, 0);
  }

  get ivaGeneral(): number {
    return this.items.controls.reduce((sum, item) => {
      return sum + (item.get('iva')?.value || 0);
    }, 0);
  }

  get descuentoValue(): number {
    return this.facturaForm.get('descuento')?.value || 0;
  }

  get totalGeneral(): number {
    return this.subtotalGeneral + this.ivaGeneral - this.descuentoValue;
  }

  // Submit
  async onSubmit() {
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.items.length === 0) {
      this.error = 'Debes agregar al menos un producto o servicio';
      return;
    }

    if (!this.clienteSeleccionado) {
      this.error = 'Debes seleccionar un cliente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      // Generar número de factura
      const numeroFactura = await this.facturasService.generarNumeroFactura();

      // Preparar items
      const items: ItemFactura[] = this.items.controls.map(item => ({
        productoId: item.get('productoCodigo')?.value,
        productoNombre: item.get('productoNombre')?.value,
        productoCodigo: item.get('productoCodigo')?.value,
        cantidad: item.get('cantidad')?.value,
        precioUnitario: item.get('precioUnitario')?.value,
        iva: item.get('iva')?.value,
        subtotal: item.get('subtotal')?.value,
        total: item.get('total')?.value
      }));

      // Preparar datos de la factura
      const facturaData = {
        numeroFactura: numeroFactura,
        clienteId: this.clienteSeleccionado.id!,
        clienteNombre: `${this.clienteSeleccionado.nombre} ${this.clienteSeleccionado.apellido}`,
        clienteRuc: this.clienteSeleccionado.ruc,
        fecha: new Date(this.facturaForm.get('fecha')?.value),
        fechaVencimiento: new Date(this.facturaForm.get('fechaVencimiento')?.value),
        items: items,
        subtotal: this.subtotalGeneral,
        iva: this.ivaGeneral,
        descuento: this.descuentoValue,
        total: this.totalGeneral,
        estado: 'pendiente' as const,
        formaPago: this.facturaForm.get('formaPago')?.value,
        notas: this.facturaForm.get('notas')?.value || ''
      };

      await this.facturasService.crear(facturaData);
      
      this.success = 'Factura creada exitosamente';
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/facturas']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creando factura:', error);
      this.error = 'Error al crear la factura. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  // Helpers
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  // Getters para validaciones
  get clienteId() {
    return this.facturaForm.get('clienteId');
  }

  get fecha() {
    return this.facturaForm.get('fecha');
  }

  get fechaVencimiento() {
    return this.facturaForm.get('fechaVencimiento');
  }

  get formaPago() {
    return this.facturaForm.get('formaPago');
  }

  get descuento() {
    return this.facturaForm.get('descuento');
  }
}