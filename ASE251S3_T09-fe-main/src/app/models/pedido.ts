export interface DetallePedido {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  numero?: string;
  clienteId: number;
  clienteNombre?: string;
  metodoPago: 'efectivo' | 'digital' | string;
  detalle?: DetallePedido[];
  cantidadItems?: number;
  resumenProductos?: string;
  fecha: string;
  total: number;
  state?: 'A' | 'I';
}
