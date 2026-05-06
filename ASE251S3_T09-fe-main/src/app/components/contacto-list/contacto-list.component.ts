import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contacto } from '../../models/contacto';

@Component({
  selector: 'app-contacto-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacto-list.component.html',
  styleUrls: ['./contacto-list.component.css']
})
export class ContactoListComponent {
  @Input() contactos: Contacto[] = [];
  @Output() editar = new EventEmitter<Contacto>();
  @Output() eliminar = new EventEmitter<number>();

  onEditar(contacto: Contacto) {
    this.editar.emit(contacto);
  }

  onEliminar(id: number) {
    this.eliminar.emit(id);
  }
}
