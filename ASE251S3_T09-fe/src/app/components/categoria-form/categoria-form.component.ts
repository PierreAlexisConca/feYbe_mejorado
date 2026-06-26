import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.css']
})
export class CategoriaFormComponent {

  @Input() categoria: Categoria | null = null;
  @Output() guardar = new EventEmitter<Categoria>();
  @Output() cancelar = new EventEmitter<void>();

  modelo: Categoria = { id: 0, nombre: '' };

  ngOnChanges() {
    if (this.categoria) {
      this.modelo = { ...this.categoria };
    } else {
      this.modelo = { id: 0, nombre: '' };
    }
  }

  onSubmit() {
    if (this.modelo.nombre.trim()) {
      this.guardar.emit(this.modelo);
    }
  }

  onCancelar() {
    this.cancelar.emit();
  }
}