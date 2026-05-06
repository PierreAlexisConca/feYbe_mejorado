import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnChanges {

  @Input() productoSeleccionado: Producto | null = null;
  @Output() productoGuardado = new EventEmitter<void>();

  producto!: Producto;

  constructor(private productoService: ProductoService) {
    this.producto = this.nuevoProducto();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoSeleccionado'] && this.productoSeleccionado) {
      this.producto = { ...this.productoSeleccionado };
    }
  }

  nuevoProducto(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0
    };
  }

  guardar(): void {
    if (this.producto.id) {
      this.productoService.editar(this.producto.id, this.producto).subscribe(() => {
        alert('Producto actualizado correctamente');
        this.producto = this.nuevoProducto();
        this.productoGuardado.emit();
      });
    } else {
      this.productoService.crear(this.producto).subscribe(() => {
        alert('Producto creado correctamente');
        this.producto = this.nuevoProducto();
        this.productoGuardado.emit();
      });
    }
  }

  limpiar(): void {
    this.producto = this.nuevoProducto();
  }
}