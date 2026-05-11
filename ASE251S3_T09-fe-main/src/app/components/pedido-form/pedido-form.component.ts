import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { CustomerService } from '../../services/customer.service';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-form.component.html',
  styleUrl: './pedido-form.component.css'
})
export class PedidoFormComponent implements OnInit {

  pedidos: any[] = [];
  clientes: any[] = [];
  productos: any[] = [];
  searchText = '';
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';
  filtroAntiguedad: 'todos' | 'recientes' | 'normales' = 'todos';

  pedido = {
    fecha: '',
    clienteId: null as number | null,
    metodoPago: 'efectivo',
    total: 0,
    items: [this.crearItemVacio()]
  };

  constructor(
    private service: PedidoService,
    private customerService: CustomerService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.cargarClientes();
    this.cargarProductos();
    this.cargar();
  }

  private crearItemVacio() {
    return {
      productoId: null as number | null,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    };
  }

  cargarClientes() {
    this.customerService.listar().subscribe(data => {
      this.clientes = (data || []).filter(c => this.esActivo(c));
    });
  }

  cargarProductos() {
    this.productoService.listar().subscribe(data => {
      this.productos = (data || []).filter(p => this.esActivo(p));
    });
  }

  cargar() {
    this.service.listar().subscribe(data => {
      this.pedidos = (data || []).slice().sort((a, b) => {
        const fechaA = new Date(a?.fecha).getTime();
        const fechaB = new Date(b?.fecha).getTime();
        return fechaB - fechaA;
      });
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editando = null;
      this.resetPedido();
    }
  }

  private resetPedido() {
    this.pedido = {
      fecha: '',
      clienteId: null,
      metodoPago: 'efectivo',
      total: 0,
      items: [this.crearItemVacio()]
    };
  }

  editar(p: any) {
    this.editando = p;

    const detalleDesdeBackend = Array.isArray(p?.detalle) ? p.detalle : [];
    const itemsForm = detalleDesdeBackend.length > 0
      ? detalleDesdeBackend.map((d: any) => ({
          productoId: this.obtenerIdRelacionado(d, ['productoId']),
          cantidad: Number(d.cantidad) || 1,
          precioUnitario: Number(d.precioUnitario) || 0,
          subtotal: Number(d.subtotal) || 0
        }))
      : [
          {
            productoId: this.obtenerIdRelacionado(p, ['productoId']),
            cantidad: Number(p.cantidad) || 1,
            precioUnitario: 0,
            subtotal: 0
          }
        ];

    this.pedido = {
      fecha: p.fecha,
      clienteId: this.obtenerIdRelacionado(p, ['clienteId']),
      metodoPago: p.metodoPago || 'efectivo',
      total: Number(p.total) || 0,
      items: itemsForm
    };

    this.pedido.items.forEach((_, idx) => {
      if (!this.pedido.items[idx].precioUnitario || this.pedido.items[idx].precioUnitario <= 0) {
        this.onProductoChange(idx);
      } else {
        this.onCantidadChange(idx);
      }
    });

    this.recalcularTotales();
    this.showForm = true;
  }

  agregarItem() {
    this.pedido.items.push(this.crearItemVacio());
  }

  quitarItem(index: number) {
    if (this.pedido.items.length === 1) {
      this.pedido.items[0] = this.crearItemVacio();
      this.recalcularTotales();
      return;
    }
    this.pedido.items.splice(index, 1);
    this.recalcularTotales();
  }

  onProductoChange(index: number) {
    const item = this.pedido.items[index];
    const producto = this.buscarProductoPorId(item.productoId);
    item.precioUnitario = producto ? Number(producto.precio) || 0 : 0;
    this.recalcularItem(index);
  }

  onCantidadChange(index: number) {
    const item = this.pedido.items[index];
    if (!item.cantidad || item.cantidad < 1) {
      item.cantidad = 1;
    }
    this.recalcularItem(index);
  }

  private recalcularItem(index: number) {
    const item = this.pedido.items[index];
    item.subtotal = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
    this.recalcularTotales();
  }

  recalcularTotales() {
    this.pedido.total = this.pedido.items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
  }

  guardarPedido() {
    const itemsValidos = this.pedido.items.filter(i => i.productoId && i.cantidad > 0);
    const clienteId = Number(this.pedido.clienteId);

    if (!this.pedido.fecha || !this.pedido.clienteId || itemsValidos.length === 0) {
      this.mostrarMensaje('Completa fecha, cliente y al menos un producto.', 'error');
      return;
    }

    const payload = {
      fecha: this.pedido.fecha,
      clienteId,
      total: Number(this.pedido.total),
      metodoPago: this.pedido.metodoPago,
      detalle: itemsValidos.map(i => ({
        productoId: Number(i.productoId),
        cantidad: Number(i.cantidad),
        precioUnitario: Number(i.precioUnitario),
        subtotal: Number(i.subtotal)
      }))
    };

    if (!['efectivo', 'digital'].includes(String(payload.metodoPago).toLowerCase())) {
      this.mostrarMensaje('Metodo de pago no valido. Usa efectivo o digital.', 'error');
      return;
    }

    if (Number.isNaN(payload.total) || payload.total <= 0) {
      this.mostrarMensaje('El total del pedido debe ser mayor a 0.', 'error');
      return;
    }

    if (this.editando) {
      this.service.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargar();
          this.editando = null;
          this.resetPedido();
          this.showForm = false;
          this.mostrarMensaje('Pedido actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.service.crear(payload).subscribe({
        next: () => {
          this.cargar();
          this.resetPedido();
          this.showForm = false;
          this.mostrarMensaje('Pedido guardado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    }
  }

  eliminar(p: any) {
    this.service.eliminar(p.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Pedido inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(p: any) {
    this.service.restaurar(p.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Pedido restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  pedidosFiltrados() {
    const filtro = this.searchText.toLowerCase();

    return this.pedidos.filter(pedido => {
      const coincideTexto =
        String(pedido.fecha || '').toLowerCase().includes(filtro) ||
        pedido.total?.toString().includes(filtro) ||
        this.obtenerNombreCliente(pedido).toLowerCase().includes(filtro) ||
        this.obtenerResumenProductos(pedido).toLowerCase().includes(filtro);

      if (!coincideTexto) {
        return false;
      }

      if (this.filtroAntiguedad === 'recientes') {
        return this.esPedidoReciente(pedido);
      }

      if (this.filtroAntiguedad === 'normales') {
        return !this.esPedidoReciente(pedido);
      }

      return true;
    });
  }

  obtenerNombreCliente(pedido: any): string {
    const nombreDirecto = pedido?.clienteNombre;
    if (typeof nombreDirecto === 'string' && nombreDirecto.trim() !== '') {
      return nombreDirecto;
    }

    const customerId = this.obtenerIdRelacionado(pedido, ['clienteId']);
    if (!customerId) {
      return 'Sin cliente';
    }
    const cliente = this.clientes.find(c => this.obtenerIdRelacionado(c, ['id', 'idCliente', 'clienteId']) === customerId);
    return cliente?.nombre || `Cliente #${customerId}`;
  }

  obtenerResumenProductos(pedido: any): string {
    if (typeof pedido?.resumenProductos === 'string' && pedido.resumenProductos.trim() !== '') {
      return pedido.resumenProductos;
    }

    const detalle = Array.isArray(pedido?.detalle) ? pedido.detalle : [];

    if (detalle.length > 0) {
      return detalle
        .map((d: any) => {
          const prod = this.buscarProductoPorId(this.obtenerIdRelacionado(d, ['productoId']));
          const nombre = d?.productoNombre || prod?.nombre || `Producto #${this.obtenerIdRelacionado(d, ['productoId']) || '?'}`;
          const cantidad = Number(d.cantidad ?? 1);
          return `${nombre} x${cantidad}`;
        })
        .join(' + ');
    }

    const prodId = this.obtenerIdRelacionado(pedido, ['productoId']);
    const cantidad = Number(pedido?.cantidad ?? 1) || 1;
    const prod = this.buscarProductoPorId(prodId);
    if (!prod) {
      return 'Sin detalle';
    }
    return `${prod.nombre} x${cantidad}`;
  }

  obtenerCantidadItems(pedido: any): number {
    if (typeof pedido?.cantidadItems === 'number') {
      return pedido.cantidadItems;
    }

    if (Array.isArray(pedido?.detalle)) {
      return pedido.detalle.reduce((acc: number, d: any) => acc + (Number(d?.cantidad) || 0), 0);
    }

    return Number(pedido?.cantidad) || 0;
  }

  esPedidoReciente(pedido: any): boolean {
    const dias = this.obtenerDiasDesdePedido(pedido);
    return dias >= 0 && dias < 2;
  }

  obtenerEtiquetaAntiguedad(pedido: any): string {
    return this.esPedidoReciente(pedido) ? 'Reciente' : 'Normal';
  }

  private obtenerDiasDesdePedido(pedido: any): number {
    const fechaPedido = new Date(pedido?.fecha);
    if (Number.isNaN(fechaPedido.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }

    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioPedido = new Date(fechaPedido.getFullYear(), fechaPedido.getMonth(), fechaPedido.getDate());
    const diferencia = inicioHoy.getTime() - inicioPedido.getTime();

    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  obtenerMetodoPago(pedido: any): string {
    const metodo = pedido?.metodoPago;
    if (!metodo) {
      return 'No especificado';
    }

    const valor = String(metodo).toLowerCase();
    if (valor.includes('efectivo')) {
      return 'Efectivo';
    }
    if (valor.includes('digital') || valor.includes('tarjeta') || valor.includes('yape') || valor.includes('plin')) {
      return 'Digital';
    }
    return String(metodo);
  }

  private buscarProductoPorId(productId: number | null): any | null {
    if (!productId) {
      return null;
    }
    return this.productos.find(p => this.obtenerIdRelacionado(p, ['id', 'idProducto', 'productoId']) === productId) || null;
  }

  private esActivo(item: any): boolean {
    if (typeof item?.estado === 'boolean') {
      return item.estado;
    }
    if (typeof item?.state === 'boolean') {
      return item.state;
    }
    if (typeof item?.state === 'string') {
      return item.state.toUpperCase() === 'A';
    }
    return true;
  }

  private obtenerIdRelacionado(origen: any, claves: string[]): number | null {
    for (const key of claves) {
      const valor = origen?.[key];
      if (typeof valor === 'number') {
        return valor;
      }
      if (typeof valor === 'string' && valor.trim() !== '' && !Number.isNaN(Number(valor))) {
        return Number(valor);
      }
    }
    return null;
  }

  private mostrarMensaje(texto: string, tipo: 'ok' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  private extraerMensajeError(error: any): string {
    return error?.error?.message || error?.error?.error || 'No se pudo guardar. Revisa los datos enviados.';
  }
}