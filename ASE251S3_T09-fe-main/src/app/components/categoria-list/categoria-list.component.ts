import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Categoria } from '../../models/categoria';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categoria-list.component.html',
  styleUrls: ['./categoria-list.component.css']
})
export class CategoriaListComponent {
  @Input() categorias: Categoria[] = [];
  @Output() editar = new EventEmitter<Categoria>();
  @Output() eliminar = new EventEmitter<number>();

  onEditar(categoria: Categoria) {
    this.editar.emit(categoria);
  }

  onEliminar(id: number) {
    this.eliminar.emit(id);
  }
}
