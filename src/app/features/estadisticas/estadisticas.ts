import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FacturasService } from '../../services/facturas';
import { ClientesService } from '../../services/clientes';
import { FirestoreService } from '../../services/firestore';
import { AuthService } from '../../services/auth';
import { Factura } from '../../models/factura';
import { Cliente } from '../../models/cliente';

interface EstadisticaMes {
  mes: string;
  ingresos: number;
  facturas: number;
}

interface TopCliente {
  id: string;
  nombre: string;
  totalFacturado: number;
  cantidadFacturas: number;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit, OnDestroy {
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  // Signals
  loading = signal(true);
  error = signal('');
  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);

  // Métricas principales
  totalIngresos = signal(0);
  ingresosMesActual = signal(0);
  facturasPendientes = signal(0);
  facturasPagadas = signal(0);
  facturasVencidas = signal(0);
  totalClientes = signal(0);
  promedioFactura = signal(0);
  montoPorCobrar = signal(0);

  // Gráficos y análisis
  estadisticasPorMes = signal<EstadisticaMes[]>([]);
  topClientes = signal<TopCliente[]>([]);
  facturasRecientes = signal<Factura[]>([]);
  facturasProximasVencer = signal<Factura[]>([]);

  // Suscripciones en tiempo real
  private unsubscribeFacturas?: () => void;
  private unsubscribeClientes?: () => void;

  async ngOnInit() {
    await this.cargarDatosEnTiempoReal();
  }

  ngOnDestroy() {
    if (this.unsubscribeFacturas) {
      this.unsubscribeFacturas();
    }
    if (this.unsubscribeClientes) {
      this.unsubscribeClientes();
    }
  }

  async cargarDatosEnTiempoReal() {
    try {
      this.loading.set(true);
      this.error.set('');

      const usuarioId = this.authService.getCurrentUserId();
      if (!usuarioId) {
        this.error.set('Usuario no autenticado');
        this.loading.set(false);
        return;
      }

      // Cargar facturas en tiempo real
      this.unsubscribeFacturas = this.firestoreService.obtenerPorUsuarioRealtime<Factura>(
        'facturas',
        usuarioId,
        (facturas) => {
          this.facturas.set(facturas);
          this.calcularEstadisticas();
        }
      );

      // Cargar clientes en tiempo real
      this.unsubscribeClientes = this.firestoreService.obtenerPorUsuarioRealtime<Cliente>(
        'clientes',
        usuarioId,
        (clientes) => {
          this.clientes.set(clientes);
          this.totalClientes.set(clientes.length);
        }
      );

      this.loading.set(false);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      this.error.set('Error al cargar las estadísticas');
      this.loading.set(false);
    }
  }

  calcularEstadisticas() {
    const facturas = this.facturas();
    
    if (facturas.length === 0) {
      this.resetearEstadisticas();
      return;
    }

    // Total de ingresos (solo facturas pagadas)
    const totalIngresos = facturas
      .filter(f => f.estado === 'pagada')
      .reduce((sum, f) => sum + f.total, 0);
    this.totalIngresos.set(totalIngresos);

    // Ingresos del mes actual
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    const ingresosMes = facturas
      .filter(f => {
        const fecha = new Date(f.fecha);
        return f.estado === 'pagada' && 
               fecha.getMonth() === mesActual && 
               fecha.getFullYear() === añoActual;
      })
      .reduce((sum, f) => sum + f.total, 0);
    this.ingresosMesActual.set(ingresosMes);

    // Contadores por estado
    this.facturasPendientes.set(facturas.filter(f => f.estado === 'pendiente').length);
    this.facturasPagadas.set(facturas.filter(f => f.estado === 'pagada').length);
    this.facturasVencidas.set(facturas.filter(f => f.estado === 'vencida').length);

    // Monto por cobrar
    const montoPorCobrar = facturas
      .filter(f => f.estado === 'pendiente' || f.estado === 'vencida')
      .reduce((sum, f) => sum + f.total, 0);
    this.montoPorCobrar.set(montoPorCobrar);

    // Promedio de factura
    const promedio = facturas.length > 0 ? 
      facturas.reduce((sum, f) => sum + f.total, 0) / facturas.length : 0;
    this.promedioFactura.set(promedio);

    // Estadísticas por mes (últimos 6 meses)
    this.calcularEstadisticasPorMes(facturas);

    // Top 5 clientes
    this.calcularTopClientes(facturas);

    // Facturas recientes
    this.facturasRecientes.set(
      facturas.slice(0, 5)
    );

    // Facturas próximas a vencer (próximos 7 días)
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);
    
    this.facturasProximasVencer.set(
      facturas
        .filter(f => {
          const vencimiento = new Date(f.fechaVencimiento);
          return f.estado === 'pendiente' && 
                 vencimiento >= hoy && 
                 vencimiento <= en7Dias;
        })
        .slice(0, 5)
    );
  }

  calcularEstadisticasPorMes(facturas: Factura[]) {
    const mesesMap = new Map<string, { ingresos: number; facturas: number }>();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Inicializar últimos 6 meses
    const hoy = new Date();
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      mesesMap.set(key, { ingresos: 0, facturas: 0 });
    }

    // Llenar con datos reales
    facturas.forEach(factura => {
      if (factura.estado === 'pagada') {
        const fecha = new Date(factura.fecha);
        const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        
        if (mesesMap.has(key)) {
          const data = mesesMap.get(key)!;
          data.ingresos += factura.total;
          data.facturas += 1;
        }
      }
    });

    // Convertir a array
    const estadisticas: EstadisticaMes[] = [];
    mesesMap.forEach((value, key) => {
      const [año, mes] = key.split('-').map(Number);
      estadisticas.push({
        mes: meses[mes],
        ingresos: value.ingresos,
        facturas: value.facturas
      });
    });

    this.estadisticasPorMes.set(estadisticas);
  }

  calcularTopClientes(facturas: Factura[]) {
    const clientesMap = new Map<string, { nombre: string; total: number; cantidad: number }>();

    facturas.forEach(factura => {
      if (!clientesMap.has(factura.clienteId)) {
        clientesMap.set(factura.clienteId, {
          nombre: factura.clienteNombre,
          total: 0,
          cantidad: 0
        });
      }

      const data = clientesMap.get(factura.clienteId)!;
      data.total += factura.total;
      data.cantidad += 1;
    });

    // Convertir a array y ordenar
    const topClientes: TopCliente[] = Array.from(clientesMap.entries())
      .map(([id, data]) => ({
        id,
        nombre: data.nombre,
        totalFacturado: data.total,
        cantidadFacturas: data.cantidad
      }))
      .sort((a, b) => b.totalFacturado - a.totalFacturado)
      .slice(0, 5);

    this.topClientes.set(topClientes);
  }

  resetearEstadisticas() {
    this.totalIngresos.set(0);
    this.ingresosMesActual.set(0);
    this.facturasPendientes.set(0);
    this.facturasPagadas.set(0);
    this.facturasVencidas.set(0);
    this.promedioFactura.set(0);
    this.montoPorCobrar.set(0);
    this.estadisticasPorMes.set([]);
    this.topClientes.set([]);
    this.facturasRecientes.set([]);
    this.facturasProximasVencer.set([]);
  }

  // Helpers
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  formatearFecha(fecha: Date | any): string {
    if (!fecha) return '-';
    const f = fecha instanceof Date ? fecha : fecha.toDate ? fecha.toDate() : new Date(fecha);
    return f.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  // Calcular porcentaje para gráficos
  calcularPorcentaje(valor: number, total: number): number {
    return total > 0 ? (valor / total) * 100 : 0;
  }

  // Obtener altura para gráfico de barras
  getAlturaGrafico(valor: number): number {
    const max = Math.max(...this.estadisticasPorMes().map(e => e.ingresos));
    return max > 0 ? (valor / max) * 100 : 0;
  }
}