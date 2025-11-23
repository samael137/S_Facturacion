import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore';
import { AuthService } from './auth';
import { Factura } from '../models/factura';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private coleccion = 'facturas';

  // Crear factura
  async crear(factura: Omit<Factura, 'id' | 'usuarioId' | 'fechaCreacion'>): Promise<string> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) throw new Error('Usuario no autenticado');

    const nuevaFactura: Omit<Factura, 'id'> = {
      ...factura,
      usuarioId,
      fechaCreacion: new Date()
    };

    return await this.firestoreService.crear(this.coleccion, nuevaFactura);
  }

  // Obtener todas las facturas del usuario
  async obtenerTodas(): Promise<Factura[]> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) throw new Error('Usuario no autenticado');

    return await this.firestoreService.obtenerPorUsuario<Factura>(this.coleccion, usuarioId);
  }

  // Obtener factura por ID
  async obtenerPorId(id: string): Promise<Factura | null> {
    return await this.firestoreService.obtenerPorId<Factura>(this.coleccion, id);
  }

  // Actualizar factura
  async actualizar(id: string, datos: Partial<Factura>): Promise<void> {
    return await this.firestoreService.actualizar(this.coleccion, id, datos);
  }

  // Eliminar factura
  async eliminar(id: string): Promise<void> {
    return await this.firestoreService.eliminar(this.coleccion, id);
  }

  // Generar número de factura automático
  async generarNumeroFactura(): Promise<string> {
    const facturas = await this.obtenerTodas();
    const numero = facturas.length + 1;
    return `FAC-${String(numero).padStart(6, '0')}`;
  }

  // Obtener facturas por estado
  async obtenerPorEstado(estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada'): Promise<Factura[]> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) return [];

    return await this.firestoreService.buscar<Factura>(
      this.coleccion,
      'estado',
      '==',
      estado,
      usuarioId
    );
  }

  // Buscar facturas
  async buscar(termino: string): Promise<Factura[]> {
    const facturas = await this.obtenerTodas();
    
    return facturas.filter(factura => 
      factura.numeroFactura.toLowerCase().includes(termino.toLowerCase()) ||
      factura.clienteNombre.toLowerCase().includes(termino.toLowerCase()) ||
      factura.clienteRuc.includes(termino)
    );
  }

  // Calcular totales de factura
  calcularTotales(items: any[], descuento: number = 0): {
    subtotal: number;
    iva: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = items.reduce((sum, item) => sum + item.iva, 0);
    const total = subtotal + iva - descuento;

    return { subtotal, iva, total };
  }
}