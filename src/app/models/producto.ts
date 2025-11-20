export interface Producto {
  id?: string;
  usuarioId: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  iva: boolean;
  porcentajeIva: number;
  fechaCreacion: Date;
  activo: boolean;
}