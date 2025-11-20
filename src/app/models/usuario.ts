export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  empresa?: string;
  telefono?: string;
  rol: 'admin' | 'usuario';
  fechaCreacion: Date;
  activo: boolean;
}