import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent implements OnInit {

  products: any[] = [];
  searchText = '';
  showInactive = false;
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  newProduct = {
    nombre: '',
    descripcion: '',
    codigo: '',
    precio: 0,
    stock: 0,
    state: 'A'
  };

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.listar().subscribe(data => {
      this.products = data;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editando = null;
      this.newProduct = { nombre: '', descripcion: '', codigo: '', precio: 0, stock: 0, state: 'A' };
    }
  }

  editar(p: any) {
    this.editando = p;
    this.newProduct = {
      nombre: p?.nombre || '',
      descripcion: p?.descripcion || '',
      codigo: p?.codigo || '',
      precio: Number(p?.precio) || 0,
      stock: Number(p?.stock) || 0,
      state: (typeof p?.state === 'string' && p.state.toUpperCase() === 'I') ? 'I' : 'A'
    };
    this.showForm = true;
  }

  guardar() {
    const payload = {
      nombre: this.newProduct.nombre.trim(),
      descripcion: this.newProduct.descripcion.trim(),
      codigo: this.newProduct.codigo.trim(),
      precio: Number(this.newProduct.precio),
      stock: Number(this.newProduct.stock),
      state: this.newProduct.state
    };

    if (!payload.nombre || !payload.descripcion || !payload.codigo || Number.isNaN(payload.precio) || Number.isNaN(payload.stock)) {
      this.mostrarMensaje('Completa todos los campos del producto.', 'error');
      return;
    }

    if (payload.stock < 0 || payload.precio <= 0) {
      this.mostrarMensaje('Precio debe ser mayor a 0 y stock no puede ser negativo.', 'error');
      return;
    }

    if (!['A', 'I'].includes(payload.state)) {
      this.mostrarMensaje('El estado del producto debe ser A o I.', 'error');
      return;
    }

    if (this.editando) {
      this.productoService.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargarProductos();
          this.editando = null;
          this.newProduct = { nombre: '', descripcion: '', codigo: '', precio: 0, stock: 0, state: 'A' };
          this.showForm = false;
          this.mostrarMensaje('Producto actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.productoService.crear(payload).subscribe({
        next: () => {
          this.cargarProductos();
          this.newProduct = { nombre: '', descripcion: '', codigo: '', precio: 0, stock: 0, state: 'A' };
          this.showForm = false;
          this.mostrarMensaje('Producto guardado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    }
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

  eliminar(p: any) {
    const productId = this.obtenerIdProducto(p);
    if (!productId) {
      this.mostrarMensaje('No se encontró el ID del producto para inactivar.', 'error');
      return;
    }

    this.productoService.eliminar(productId).subscribe({
      next: () => {
        this.cargarProductos();
        this.mostrarMensaje('Producto inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(p: any) {
    const productId = this.obtenerIdProducto(p);
    if (!productId) {
      this.mostrarMensaje('No se encontró el ID del producto para restaurar.', 'error');
      return;
    }

    this.productoService.restaurar(productId).subscribe({
      next: () => {
        this.cargarProductos();
        this.mostrarMensaje('Producto restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  getEstadoStock(stock: number): { estado: string; color: string } {
    const s = stock || 0;
    if (s >= 50) {
      return { estado: 'ESTABLE', color: 'verde' };
    } else if (s > 0 && s < 50) {
      return { estado: 'POR AGOTARSE', color: 'amarillo' };
    } else {
      return { estado: 'AGOTADO', color: 'rojo' };
    }
  }

  get filtrados() {
    return this.products.filter(p => {
      const estadoValido = this.showInactive ? true : this.esProductoActivo(p);
      const textoValido = p.nombre?.toLowerCase().includes(this.searchText.toLowerCase());
      return estadoValido && textoValido;
    });
  }

  esProductoActivo(product: any): boolean {
    if (typeof product?.estado === 'boolean') {
      return product.estado;
    }

    if (typeof product?.state === 'boolean') {
      return product.state;
    }

    if (typeof product?.state === 'string') {
      return product.state.toUpperCase() === 'A';
    }

    return true;
  }

  private obtenerIdProducto(product: any): number | null {
    const id = product?.id ?? product?.idProducto ?? product?.productoId;
    if (typeof id === 'number') {
      return id;
    }
    if (typeof id === 'string' && id.trim() !== '' && !Number.isNaN(Number(id))) {
      return Number(id);
    }
    return null;
  }
}