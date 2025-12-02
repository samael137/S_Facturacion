import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FacturasService } from '../../../services/facturas';
import { ClientesService } from '../../../services/clientes';
import { Factura, ItemFactura } from '../../../models/factura';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-editar-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-factura.html',
  styleUrl: './editar-factura.css'
})
export class EditarFactura implements OnInit {
  private fb = inject(FormBuilder);
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  facturaForm: FormGroup;
  loading = false;
  loadingData = true;
  loadingClientes = true;
  error = '';
  success = '';
  facturaId: string | null = null;
  facturaOriginal: Factura | null = null;

  // Clientes disponibles
  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;

  // Lista de productos predefinidos
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
      fecha: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      formaPago: ['efectivo', Validators.required],
      estado: ['pendiente', Validators.required],
      items: this.fb.array([]),
      descuento: [0, [Validators.min(0)]],
      notas: ['']
    });
  }

  async ngOnInit() {
    this.facturaId = this.route.snapshot.paramMap.get('id');
    
    if (!this.facturaId) {
      this.error = 'ID de factura no válido';
      this.loadingData = false;
      return;
    }

    // ✅ PRIMERO cargar clientes, LUEGO la factura
    await this.cargarClientes();
    await this.cargarFactura();
  }

  async cargarClientes() {
    try {
      this.loadingClientes = true;
      this.clientes = await this.clientesService.obtenerTodos();
      console.log('Clientes cargados:', this.clientes.length);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      this.error = 'Error al cargar los clientes';
    } finally {
      this.loadingClientes = false;
    }
  }

  async cargarFactura() {
    try {
      this.loadingData = true;
      this.error = '';

      const factura = await this.facturasService.obtenerPorId(this.facturaId!);
      
      if (!factura) {
        this.error = 'Factura no encontrada';
        return;
      }

      console.log('Factura cargada:', factura);
      this.facturaOriginal = factura;

      // Formatear fechas correctamente
      const fechaEmision = this.formatearFechaInput(factura.fecha);
      const fechaVenc = this.formatearFechaInput(factura.fechaVencimiento);

      console.log('Fecha emisión formateada:', fechaEmision);
      console.log('Fecha vencimiento formateada:', fechaVenc);

      // Cargar datos en el formulario
      this.facturaForm.patchValue({
        clienteId: factura.clienteId,
        fecha: fechaEmision,
        fechaVencimiento: fechaVenc,
        formaPago: factura.formaPago,
        estado: factura.estado,
        descuento: factura.descuento,
        notas: factura.notas || ''
      });

      // Cargar items
      factura.items.forEach(item => {
        this.items.push(this.crearItemConDatos(item));
      });

      // ✅ IMPORTANTE: Cargar cliente seleccionado DESPUÉS de tener los clientes
      this.clienteSeleccionado = this.clientes.find(c => c.id === factura.clienteId) || null;
      console.log('Cliente seleccionado:', this.clienteSeleccionado);

      if (!this.clienteSeleccionado) {
        console.warn('No se encontró el cliente con ID:', factura.clienteId);
      }

    } catch (error) {
      console.error('Error cargando factura:', error);
      this.error = 'Error al cargar los datos de la factura';
    } finally {
      this.loadingData = false;
    }
  }

  // FormArray de items
  get items(): FormArray {
    return this.facturaForm.get('items') as FormArray;
  }

  // Crear un nuevo item vacío
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

  // Crear item con datos existentes
  crearItemConDatos(itemData: ItemFactura): FormGroup {
    const item = this.fb.group({
      productoCodigo: [itemData.productoCodigo, Validators.required],
      productoNombre: [itemData.productoNombre, Validators.required],
      cantidad: [itemData.cantidad, [Validators.required, Validators.min(1)]],
      precioUnitario: [itemData.precioUnitario, [Validators.required, Validators.min(0)]],
      iva: [itemData.iva],
      subtotal: [itemData.subtotal],
      total: [itemData.total]
    });
    return item;
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
    const iva = subtotal * 0.18;
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
    console.log('Cliente cambiado:', this.clienteSeleccionado);
  }

  // Formatear fecha para input - MEJORADO
  formatearFechaInput(fecha: Date | any): string {
    if (!fecha) return '';
    
    try {
      let f: Date;
      
      // Si es un Timestamp de Firebase
      if (fecha.toDate && typeof fecha.toDate === 'function') {
        f = fecha.toDate();
      }
      // Si ya es una fecha
      else if (fecha instanceof Date) {
        f = fecha;
      }
      // Si es un string o número
      else {
        f = new Date(fecha);
      }
      
      // Formatear a YYYY-MM-DD
      const year = f.getFullYear();
      const month = String(f.getMonth() + 1).padStart(2, '0');
      const day = String(f.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formateando fecha:', error, fecha);
      return '';
    }
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

  // Verificar si hay cambios
  get hasChanges(): boolean {
    if (!this.facturaOriginal) return false;
    
    const formValue = this.facturaForm.value;
    
    // Comparar campos básicos
    if (
      formValue.clienteId !== this.facturaOriginal.clienteId ||
      formValue.fecha !== this.formatearFechaInput(this.facturaOriginal.fecha) ||
      formValue.fechaVencimiento !== this.formatearFechaInput(this.facturaOriginal.fechaVencimiento) ||
      formValue.formaPago !== this.facturaOriginal.formaPago ||
      formValue.estado !== this.facturaOriginal.estado ||
      formValue.descuento !== this.facturaOriginal.descuento ||
      formValue.notas !== (this.facturaOriginal.notas || '')
    ) {
      return true;
    }

    // Comparar items
    if (this.items.length !== this.facturaOriginal.items.length) {
      return true;
    }

    for (let i = 0; i < this.items.length; i++) {
      const itemForm = this.items.at(i).value;
      const itemOriginal = this.facturaOriginal.items[i];
      
      if (
        itemForm.productoCodigo !== itemOriginal.productoCodigo ||
        itemForm.productoNombre !== itemOriginal.productoNombre ||
        itemForm.cantidad !== itemOriginal.cantidad ||
        itemForm.precioUnitario !== itemOriginal.precioUnitario
      ) {
        return true;
      }
    }

    return false;
  }

  // Submit
  async onSubmit() {
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.items.length === 0) {
      this.error = 'Debes tener al menos un producto o servicio';
      return;
    }

    if (!this.clienteSeleccionado) {
      this.error = 'Debes seleccionar un cliente';
      return;
    }

    if (!this.facturaId) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
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

      // Preparar datos actualizados
      const facturaData = {
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
        estado: this.facturaForm.get('estado')?.value,
        formaPago: this.facturaForm.get('formaPago')?.value,
        notas: this.facturaForm.get('notas')?.value || '',
        fechaActualizacion: new Date()
      };

      await this.facturasService.actualizar(this.facturaId, facturaData);
      
      this.success = 'Factura actualizada exitosamente';
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/facturas']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error actualizando factura:', error);
      this.error = 'Error al actualizar la factura. Intenta de nuevo.';
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

  get estado() {
    return this.facturaForm.get('estado');
  }

  get descuento() {
    return this.facturaForm.get('descuento');
  }
}