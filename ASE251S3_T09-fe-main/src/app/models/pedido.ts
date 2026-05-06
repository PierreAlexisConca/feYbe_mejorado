export interface Pedido {
  id: number;
  clienteId: number;
  productoId: number;
  proveedorId: number;
  cantidad: number;
  fecha: string; // LocalDate en backend, string ISO en frontend
  estado: boolean;
  total: number;
}
