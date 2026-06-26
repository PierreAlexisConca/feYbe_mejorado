import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomerService } from '../../services/customer.service';
import { Cliente } from '../../models/cliente';
@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.css'],
})
export class CustomerForm implements OnChanges {
  @Input() cliente: Cliente | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formCliente: Cliente = { id: 0, nombre: '', email: '', telefono: '' };

  constructor(private customerService: CustomerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] && this.cliente) {
      this.formCliente = { ...this.cliente };
    } else {
      this.formCliente = { id: 0, nombre: '', email: '', telefono: '' };
    }
  }

  onSave(): void {
    if (!this.formCliente.nombre || !this.formCliente.telefono) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (this.cliente) {
      this.customerService.updateCustomer(this.cliente.id, this.formCliente).subscribe({
        next: () => {
          alert('Cliente actualizado correctamente');
          this.guardado.emit();
        }
      });
    } else {
      this.customerService.createCustomer(this.formCliente).subscribe({
        next: () => {
          alert('Cliente creado correctamente');
          this.guardado.emit();
        }
      });
    }
  }

  onCancel(): void {
    this.cancelado.emit();
  }
}