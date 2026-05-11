export interface Producto {
  id?: number;
  idProducto?: number;
  productoId?: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  precio: number;
  stock: number;
  state?: 'A' | 'I';
}