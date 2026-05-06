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
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  newProduct = {
    nombre: '',
    descripcion: '',
    precio: 0
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
      this.newProduct = { nombre: '', descripcion: '', precio: 0 };
    }
  }

  editar(p: any) {
    this.editando = p;
    this.newProduct = { nombre: p.nombre, descripcion: p.descripcion, precio: p.precio };
    this.showForm = true;
  }

  guardar() {
    const payload = {
      nombre: this.newProduct.nombre.trim(),
      descripcion: this.newProduct.descripcion.trim(),
      precio: Number(this.newProduct.precio)
    };

    if (!payload.nombre || !payload.descripcion || Number.isNaN(payload.precio)) {
      this.mostrarMensaje('Completa todos los campos del producto.', 'error');
      return;
    }

    if (this.editando) {
      this.productoService.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargarProductos();
          this.editando = null;
          this.newProduct = { nombre: '', descripcion: '', precio: 0 };
          this.showForm = false;
          this.mostrarMensaje('Producto actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.productoService.crear(payload).subscribe({
        next: () => {
          this.cargarProductos();
          this.newProduct = { nombre: '', descripcion: '', precio: 0 };
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
    this.productoService.eliminar(p.id).subscribe({
      next: () => {
        this.cargarProductos();
        this.mostrarMensaje('Producto inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(p: any) {
    this.productoService.restaurar(p.id).subscribe({
      next: () => {
        this.cargarProductos();
        this.mostrarMensaje('Producto restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  get filtrados() {
    return this.products.filter(p =>
      p.nombre.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}