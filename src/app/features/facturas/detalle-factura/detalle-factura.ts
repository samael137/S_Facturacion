import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FacturasService } from '../../../services/facturas';
import { Factura } from '../../../models/factura';

@Component({
  selector: 'app-detalle-factura',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-factura.html',
  styleUrl: './detalle-factura.css'
})
export class DetalleFactura implements OnInit {
  private facturasService = inject(FacturasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  factura: Factura | null = null;
  loading = true;
  error = '';
  facturaId: string | null = null;

  // Modal de confirmación
  mostrarModalEliminar = false;
  eliminando = false;

  async ngOnInit() {
    this.facturaId = this.route.snapshot.paramMap.get('id');
    
    if (!this.facturaId) {
      this.error = 'ID de factura no válido';
      this.loading = false;
      return;
    }

    await this.cargarFactura();
  }

  async cargarFactura() {
    try {
      this.loading = true;
      this.error = '';

      const factura = await this.facturasService.obtenerPorId(this.facturaId!);
      
      if (!factura) {
        this.error = 'Factura no encontrada';
        return;
      }

      this.factura = factura;

    } catch (error) {
      console.error('Error cargando factura:', error);
      this.error = 'Error al cargar los datos de la factura';
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

  async eliminarFactura() {
    if (!this.facturaId) return;

    try {
      this.eliminando = true;
      await this.facturasService.eliminar(this.facturaId);
      
      // Redirigir a la lista
      this.router.navigate(['/facturas']);
      
    } catch (error) {
      console.error('Error eliminando factura:', error);
      this.error = 'Error al eliminar la factura. Intenta de nuevo.';
      this.cancelarEliminar();
    } finally {
      this.eliminando = false;
    }
  }

  editarFactura() {
    if (this.facturaId) {
      this.router.navigate(['/facturas/editar', this.facturaId]);
    }
  }

  imprimirFactura() {
    window.print();
  }

  descargarPDF() {
    // Aquí implementarías la lógica para generar y descargar el PDF
    alert('Función de descarga PDF en desarrollo');
  }

  enviarPorEmail() {
    if (this.factura) {
      const subject = `Factura ${this.factura.numeroFactura}`;
      const body = `Estimado cliente,\n\nAdjunto encontrará la factura ${this.factura.numeroFactura}.\n\nSaludos cordiales.`;
      window.location.href = `mailto:${this.factura.clienteNombre}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  // Helpers
  formatearFecha(fecha: Date | any): string {
    if (!fecha) return '-';
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    return f.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
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

  getFormaPagoTexto(formaPago: string): string {
    const textos: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque'
    };
    return textos[formaPago] || formaPago;
  }
}