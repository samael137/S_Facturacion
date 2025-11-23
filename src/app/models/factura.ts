export interface Factura {
  id?: string;
  usuarioId: string;
  numeroFactura: string;
  clienteId: string;
  clienteNombre: string;
  clienteRuc: string;
  fecha: Date;
  fechaVencimiento: Date;
  items: ItemFactura[];
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  formaPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface ItemFactura {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  iva: number;
  subtotal: number;
  total: number;
}