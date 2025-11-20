export interface Cliente {
  id?: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  empresa?: string;
  ruc: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  fechaRegistro: Date;
  activo: boolean;
}