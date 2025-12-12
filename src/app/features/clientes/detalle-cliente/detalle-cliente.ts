import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesService } from '../../../services/clientes';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-cliente.html',
  styleUrl: './detalle-cliente.css'
})
export class DetalleCliente implements OnInit {
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cliente: Cliente | null = null;
  loading = true;
  error = '';
  clienteId: string | null = null;

  // Modal de confirmación
  mostrarModalEliminar = false;
  eliminando = false;

  async ngOnInit() {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    
    if (!this.clienteId) {
      this.error = 'ID de cliente no válido';
      this.loading = false;
      return;
    }

    await this.cargarCliente();
  }

  async cargarCliente() {
    try {
      this.loading = true;
      this.error = '';

      const cliente = await this.clientesService.obtenerPorId(this.clienteId!);
      
      if (!cliente) {
        this.error = 'Cliente no encontrado';
        return;
      }

      this.cliente = cliente;

    } catch (error) {
      console.error('Error cargando cliente:', error);
      this.error = 'Error al cargar los datos del cliente';
    } finally {
      this.loading = false;
    }
  }

  confirmarEliminar() {
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar() {
    this.mostrarModalEliminar = false;
  }

  async eliminarCliente() {
    if (!this.clienteId) return;

    try {
      this.eliminando = true;
      await this.clientesService.eliminar(this.clienteId);
      
      // Redirigir a la lista
      this.router.navigate(['/clientes']);
      
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      this.error = 'Error al eliminar el cliente. Intenta de nuevo.';
      this.cancelarEliminar();
    } finally {
      this.eliminando = false;
    }
  }

  editarCliente() {
    if (this.clienteId) {
      this.router.navigate(['/clientes/editar', this.clienteId]);
    }
  }

  // ✅ MÉTODO CORREGIDO - Maneja Timestamp de Firestore
  formatearFecha(fecha: any): string {
    if (!fecha) {
      return 'Fecha no disponible';
    }

    try {
      let dateObj: Date;

      // Si es un Timestamp de Firestore
      if (fecha.toDate && typeof fecha.toDate === 'function') {
        dateObj = fecha.toDate();
      }
      // Si ya es un objeto Date
      else if (fecha instanceof Date) {
        dateObj = fecha;
      }
      // Si es un string o número
      else {
        dateObj = new Date(fecha);
      }

      // Validar que la fecha sea válida
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }

      return dateObj.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, fecha);
      return 'Error en fecha';
    }
  }

  getIniciales(): string {
    if (!this.cliente) return '?';
    const nombre = this.cliente.nombre?.charAt(0) || '';
    const apellido = this.cliente.apellido?.charAt(0) || '';
    return `${nombre}${apellido}`.toUpperCase() || '?';
  }
}