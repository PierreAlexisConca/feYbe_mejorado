import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contacto } from '../../models/contacto';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-form.component.html',
  styleUrls: ['./contacto-form.component.css']
})
export class ContactoFormComponent {

  @Input() contacto: Contacto | null = null;
  @Output() guardar = new EventEmitter<Contacto>();
  @Output() cancelar = new EventEmitter<void>();

  modelo: Contacto = { id: 0, nombre: '', telefono: '', email: '' };

  ngOnChanges() {
    if (this.contacto) {
      this.modelo = { ...this.contacto };
    } else {
      this.modelo = { id: 0, nombre: '', telefono: '', email: '' };
    }
  }

  onSubmit() {
    if (this.modelo.nombre.trim() && this.modelo.email.trim()) {
      this.guardar.emit(this.modelo);
    }
  }

  onCancelar() {
    this.cancelar.emit();
  }
}