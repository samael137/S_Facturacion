import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore';
import { AuthService } from './auth';
import { Cliente } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private coleccion = 'clientes';

  // Crear cliente
  async crear(cliente: Omit<Cliente, 'id' | 'usuarioId' | 'fechaRegistro' | 'activo'>): Promise<string> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) throw new Error('Usuario no autenticado');

    const nuevoCliente: Omit<Cliente, 'id'> = {
      ...cliente,
      usuarioId,
      fechaRegistro: new Date(),
      activo: true
    };

    return await this.firestoreService.crear(this.coleccion, nuevoCliente);
  }

  // Obtener todos los clientes del usuario
  async obtenerTodos(): Promise<Cliente[]> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) throw new Error('Usuario no autenticado');

    return await this.firestoreService.obtenerPorUsuario<Cliente>(this.coleccion, usuarioId);
  }

  // Obtener cliente por ID
  async obtenerPorId(id: string): Promise<Cliente | null> {
    return await this.firestoreService.obtenerPorId<Cliente>(this.coleccion, id);
  }

  // Actualizar cliente
  async actualizar(id: string, datos: Partial<Cliente>): Promise<void> {
    return await this.firestoreService.actualizar(this.coleccion, id, datos);
  }

  // Eliminar cliente
  async eliminar(id: string): Promise<void> {
    return await this.firestoreService.eliminar(this.coleccion, id);
  }

  // Buscar clientes por nombre o RUC
  async buscar(termino: string): Promise<Cliente[]> {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) return [];

    const clientes = await this.obtenerTodos();
    
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.ruc.includes(termino) ||
      cliente.email.toLowerCase().includes(termino.toLowerCase())
    );
  }
}