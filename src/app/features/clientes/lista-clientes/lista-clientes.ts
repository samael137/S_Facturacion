import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../services/clientes';
import { FirestoreService } from '../../../services/firestore';
import { AuthService } from '../../../services/auth';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.css'
})
export class ListaClientes implements OnInit, OnDestroy {
  private clientesService = inject(ClientesService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  // Signals
  clientes = signal<Cliente[]>([]);
  clientesFiltrados = signal<Cliente[]>([]);
  loading = signal(true);
  error = signal('');
  
  // Búsqueda y filtros
  terminoBusqueda = '';
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  
  // Ordenamiento
  columnaOrden: 'nombre' | 'ruc' | 'email' | 'ciudad' | 'fechaRegistro' = 'fechaRegistro';
  direccionOrden: 'asc' | 'desc' = 'desc';

  // Confirmación de eliminación
  clienteAEliminar: Cliente | null = null;
  mostrarModalEliminar = false;

  // Suscripción en tiempo real
  private unsubscribeRealtime?: () => void;

  async ngOnInit() {
    await this.cargarClientesRealtime();
  }

  ngOnDestroy() {
    // Cancelar suscripción al destruir el componente
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }
  }

  // ✨ NUEVO: Cargar clientes en TIEMPO REAL
  async cargarClientesRealtime() {
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
      this.unsubscribeRealtime = this.firestoreService.obtenerPorUsuarioRealtime<Cliente>(
        'clientes',
        usuarioId,
        (clientes) => {
          console.log('Clientes actualizados en tiempo real:', clientes);
          this.clientes.set(clientes);
          this.aplicarFiltrosYOrden();
          this.loading.set(false);
        }
      );
      
    } catch (error) {
      console.error('Error cargando clientes:', error);
      this.error.set('Error al cargar los clientes. Intenta de nuevo.');
      this.loading.set(false);
    }
  }

  // Método alternativo: Cargar SIN tiempo real (por si quieres usarlo)
  async cargarClientes() {
    try {
      this.loading.set(true);
      this.error.set('');
      
      const clientes = await this.clientesService.obtenerTodos();
      this.clientes.set(clientes);
      this.aplicarFiltrosYOrden();
      
    } catch (error) {
      console.error('Error cargando clientes:', error);
      this.error.set('Error al cargar los clientes. Intenta de nuevo.');
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

  // Aplicar filtros y ordenamiento
  aplicarFiltrosYOrden() {
    let resultado = [...this.clientes()];

    // Filtrar por búsqueda
    if (this.terminoBusqueda) {
      resultado = resultado.filter(cliente =>
        cliente.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        cliente.apellido.toLowerCase().includes(this.terminoBusqueda) ||
        cliente.ruc.includes(this.terminoBusqueda) ||
        cliente.email.toLowerCase().includes(this.terminoBusqueda) ||
        cliente.ciudad.toLowerCase().includes(this.terminoBusqueda) ||
        (cliente.empresa && cliente.empresa.toLowerCase().includes(this.terminoBusqueda))
      );
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.columnaOrden) {
        case 'nombre':
          valorA = `${a.nombre} ${a.apellido}`.toLowerCase();
          valorB = `${b.nombre} ${b.apellido}`.toLowerCase();
          break;
        case 'ruc':
          valorA = a.ruc;
          valorB = b.ruc;
          break;
        case 'email':
          valorA = a.email.toLowerCase();
          valorB = b.email.toLowerCase();
          break;
        case 'ciudad':
          valorA = a.ciudad.toLowerCase();
          valorB = b.ciudad.toLowerCase();
          break;
        case 'fechaRegistro':
          valorA = new Date(a.fechaRegistro).getTime();
          valorB = new Date(b.fechaRegistro).getTime();
          break;
      }

      if (valorA < valorB) return this.direccionOrden === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });

    this.clientesFiltrados.set(resultado);
  }

  // Cambiar ordenamiento
  ordenarPor(columna: 'nombre' | 'ruc' | 'email' | 'ciudad' | 'fechaRegistro') {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.aplicarFiltrosYOrden();
  }

  // Paginación
  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.clientesFiltrados().slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados().length / this.itemsPorPagina);
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
  confirmarEliminar(cliente: Cliente) {
    this.clienteAEliminar = cliente;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar() {
    this.clienteAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  async eliminarCliente() {
    if (!this.clienteAEliminar?.id) return;

    try {
      await this.clientesService.eliminar(this.clienteAEliminar.id);
      // NO necesitas cargarClientes() porque el tiempo real lo actualiza automáticamente
      this.cancelarEliminar();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      this.error.set('Error al eliminar el cliente. Intenta de nuevo.');
    }
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

  getIconoOrden(columna: string): string {
    if (this.columnaOrden !== columna) return '⇅';
    return this.direccionOrden === 'asc' ? '↑' : '↓';
  }
}