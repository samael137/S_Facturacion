import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../../services/facturas';
import { FirestoreService } from '../../../services/firestore';
import { AuthService } from '../../../services/auth';
import { Factura } from '../../../models/factura';
import { RucFormatPipe } from '../../../shared/pipes/ruc-format-pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format-pipe';
import { EstadoBadgePipe } from '../../../shared/pipes/estado-badge-pipe';  

@Component({
  selector: 'app-lista-facturas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RucFormatPipe, CurrencyFormatPipe, EstadoBadgePipe],
  templateUrl: './lista-facturas.html',
  styleUrl: './lista-facturas.css'
})
export class ListaFacturas implements OnInit, OnDestroy {
  private facturasService = inject(FacturasService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  // Signals
  facturas = signal<Factura[]>([]);
  facturasFiltradas = signal<Factura[]>([]);
  loading = signal(true);
  error = signal('');
  
  // Búsqueda y filtros
  terminoBusqueda = '';
  filtroEstado: 'todos' | 'pendiente' | 'pagada' | 'vencida' | 'anulada' = 'todos';
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  
  // Ordenamiento
  columnaOrden: 'numeroFactura' | 'clienteNombre' | 'fecha' | 'total' | 'estado' = 'fecha';
  direccionOrden: 'asc' | 'desc' = 'desc';

  // Confirmación de eliminación
  facturaAEliminar: Factura | null = null;
  mostrarModalEliminar = false;

  // Suscripción en tiempo real
  private unsubscribeRealtime?: () => void;

  async ngOnInit() {
    await this.cargarFacturasRealtime();
  }

  ngOnDestroy() {
    // Cancelar suscripción al destruir el componente
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }
  }

  // ✨ NUEVO: Cargar facturas en TIEMPO REAL
  async cargarFacturasRealtime() {
    try {
      this.loading.set(true);
      this.error.set('');
      
      const usuarioId = this.authService.getCurrentUserId();
      if (!usuarioId) {
        this.error.set('Usuario no autenticado');
        this.loading.set(false);
        return;
      }

      // Escuchar cambios en tiempo real
      this.unsubscribeRealtime = this.firestoreService.obtenerPorUsuarioRealtime<Factura>(
        'facturas',
        usuarioId,
        (facturas) => {
          console.log('Facturas actualizadas en tiempo real:', facturas);
          this.facturas.set(facturas);
          this.aplicarFiltrosYOrden();
          this.loading.set(false);
        }
      );
      
    } catch (error) {
      console.error('Error cargando facturas:', error);
      this.error.set('Error al cargar las facturas. Intenta de nuevo.');
      this.loading.set(false);
    }
  }

  // Método alternativo: Cargar SIN tiempo real
  async cargarFacturas() {
    try {
      this.loading.set(true);
      this.error.set('');
      
      const facturas = await this.facturasService.obtenerTodas();
      this.facturas.set(facturas);
      this.aplicarFiltrosYOrden();
      
    } catch (error) {
      console.error('Error cargando facturas:', error);
      this.error.set('Error al cargar las facturas. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  // Búsqueda en tiempo real
  onBuscar(termino: string) {
    this.terminoBusqueda = termino.toLowerCase();
    this.paginaActual = 1;
    this.aplicarFiltrosYOrden();
  }

  // Filtrar por estado
  onFiltrarEstado(estado: 'todos' | 'pendiente' | 'pagada' | 'vencida' | 'anulada') {
    this.filtroEstado = estado;
    this.paginaActual = 1;
    this.aplicarFiltrosYOrden();
  }

  // Aplicar filtros y ordenamiento
  aplicarFiltrosYOrden() {
    let resultado = [...this.facturas()];

    // Filtrar por búsqueda
    if (this.terminoBusqueda) {
      resultado = resultado.filter(factura =>
        factura.numeroFactura.toLowerCase().includes(this.terminoBusqueda) ||
        factura.clienteNombre.toLowerCase().includes(this.terminoBusqueda) ||
        factura.clienteRuc.includes(this.terminoBusqueda)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(factura => factura.estado === this.filtroEstado);
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.columnaOrden) {
        case 'numeroFactura':
          valorA = a.numeroFactura.toLowerCase();
          valorB = b.numeroFactura.toLowerCase();
          break;
        case 'clienteNombre':
          valorA = a.clienteNombre.toLowerCase();
          valorB = b.clienteNombre.toLowerCase();
          break;
        case 'fecha':
          valorA = new Date(a.fecha).getTime();
          valorB = new Date(b.fecha).getTime();
          break;
        case 'total':
          valorA = a.total;
          valorB = b.total;
          break;
        case 'estado':
          valorA = a.estado;
          valorB = b.estado;
          break;
      }

      if (valorA < valorB) return this.direccionOrden === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });

    this.facturasFiltradas.set(resultado);
  }

  // Cambiar ordenamiento
  ordenarPor(columna: 'numeroFactura' | 'clienteNombre' | 'fecha' | 'total' | 'estado') {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.aplicarFiltrosYOrden();
  }

  // Paginación
  get facturasPaginadas(): Factura[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.facturasFiltradas().slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.facturasFiltradas().length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);

    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  // Confirmar eliminación
  confirmarEliminar(factura: Factura) {
    this.facturaAEliminar = factura;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar() {
    this.facturaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  async eliminarFactura() {
    if (!this.facturaAEliminar?.id) return;

    try {
      await this.facturasService.eliminar(this.facturaAEliminar.id);
      // NO necesitas cargarFacturas() porque el tiempo real lo actualiza automáticamente
      this.cancelarEliminar();
    } catch (error) {
      console.error('Error eliminando factura:', error);
      this.error.set('Error al eliminar la factura. Intenta de nuevo.');
    }
  }

  // Estadísticas
  get totalFacturas(): number {
    return this.facturas().length;
  }

  get totalPendientes(): number {
    return this.facturas().filter(f => f.estado === 'pendiente').length;
  }

  get totalPagadas(): number {
    return this.facturas().filter(f => f.estado === 'pagada').length;
  }

  get totalVencidas(): number {
    return this.facturas().filter(f => f.estado === 'vencida').length;
  }

  get montoTotal(): number {
    return this.facturas().reduce((sum, f) => sum + f.total, 0);
  }

  get montoPendiente(): number {
    return this.facturas()
      .filter(f => f.estado === 'pendiente')
      .reduce((sum, f) => sum + f.total, 0);
  }

  // Helpers
  formatearFecha(fecha: Date | any): string {
    if (!fecha) return '-';
    const f = fecha instanceof Date ? fecha : fecha.toDate ? fecha.toDate() : new Date(fecha);
    return f.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  //formatearMoneda(valor: number): string {
  //  return new Intl.NumberFormat('es-PE', {
  //    style: 'currency',
  //    currency: 'PEN'
  //  }).format(valor);
  //}

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'pagada': 'estado-pagada',
      'vencida': 'estado-vencida',
      'anulada': 'estado-anulada'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'pagada': 'Pagada',
      'vencida': 'Vencida',
      'anulada': 'Anulada'
    };
    return textos[estado] || estado;
  }

  getIconoOrden(columna: string): string {
    if (this.columnaOrden !== columna) return '⇅';
    return this.direccionOrden === 'asc' ? '↑' : '↓';
  }
}