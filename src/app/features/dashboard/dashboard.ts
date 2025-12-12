import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FacturasService } from '../../services/facturas';
import { ClientesService } from '../../services/clientes';
import { Factura } from '../../models/factura';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);

  // Signals para datos reactivos
  loading = signal(true);
  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);
  
  // Estadísticas
  totalFacturas = signal(0);
  facturasPendientes = signal(0);
  facturasPagadas = signal(0);
  totalClientes = signal(0);
  ingresosMes = signal(0);
  facturasVencidas = signal(0);

  // Últimas facturas
  ultimasFacturas = signal<Factura[]>([]);

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.loading.set(true);

      // Cargar facturas y clientes en paralelo
      const [facturas, clientes] = await Promise.all([
        this.facturasService.obtenerTodas(),
        this.clientesService.obtenerTodos()
      ]);

      this.facturas.set(facturas);
      this.clientes.set(clientes);

      // Calcular estadísticas
      this.calcularEstadisticas(facturas, clientes);

      // Obtener últimas 5 facturas
      this.ultimasFacturas.set(facturas.slice(0, 5));

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading.set(false);
    }
  }

  calcularEstadisticas(facturas: Factura[], clientes: Cliente[]) {
    // Total de facturas
    this.totalFacturas.set(facturas.length);

    // Facturas por estado
    const pendientes = facturas.filter(f => f.estado === 'pendiente').length;
    const pagadas = facturas.filter(f => f.estado === 'pagada').length;
    const vencidas = facturas.filter(f => f.estado === 'vencida').length;

    this.facturasPendientes.set(pendientes);
    this.facturasPagadas.set(pagadas);
    this.facturasVencidas.set(vencidas);

    // Total de clientes
    this.totalClientes.set(clientes.length);

    // Ingresos del mes actual
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    const ingresos = facturas
      .filter(f => {
        // ✅ Convertir fecha correctamente
        const fechaFactura = this.convertirAFecha(f.fecha);
        if (!fechaFactura) return false;
        
        return fechaFactura.getMonth() === mesActual && 
               fechaFactura.getFullYear() === añoActual &&
               f.estado === 'pagada';
      })
      .reduce((sum, f) => sum + f.total, 0);

    this.ingresosMes.set(ingresos);
  }

  // ✅ NUEVO MÉTODO - Convierte cualquier tipo de fecha
  private convertirAFecha(fecha: any): Date | null {
    if (!fecha) return null;

    try {
      // Si es Timestamp de Firestore
      if (fecha.toDate && typeof fecha.toDate === 'function') {
        return fecha.toDate();
      }
      // Si ya es Date
      if (fecha instanceof Date) {
        return fecha;
      }
      // Si es string o número
      const dateObj = new Date(fecha);
      return isNaN(dateObj.getTime()) ? null : dateObj;
    } catch {
      return null;
    }
  }

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
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, fecha);
      return 'Error en fecha';
    }
  }

  formatearMoneda(valor: number): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return 'S/ 0.00';
    }
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }
}