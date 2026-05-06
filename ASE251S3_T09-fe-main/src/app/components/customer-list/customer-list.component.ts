import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {

  customers: any[] = [];
  searchText = '';
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  newCustomer = {
    nombre: '',
    email: '',
    telefono: ''
  };

  constructor(private service: CustomerService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe(data => this.customers = data);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editando = null;
      this.newCustomer = { nombre: '', email: '', telefono: '' };
    }
  }

  editar(c: any) {
    this.editando = c;
    this.newCustomer = { nombre: c.nombre, email: c.email, telefono: c.telefono };
    this.showForm = true;
  }

  guardar() {
    const payload = {
      nombre: this.newCustomer.nombre.trim(),
      email: this.newCustomer.email.trim(),
      telefono: this.newCustomer.telefono.trim()
    };

    if (!payload.nombre || !payload.email || !payload.telefono) {
      this.mostrarMensaje('Completa todos los campos del cliente.', 'error');
      return;
    }

    if (this.editando) {
      this.service.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargar();
          this.editando = null;
          this.newCustomer = { nombre: '', email: '', telefono: '' };
          this.showForm = false;
          this.mostrarMensaje('Cliente actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.service.crear(payload).subscribe({
        next: () => {
          this.cargar();
          this.newCustomer = { nombre: '', email: '', telefono: '' };
          this.showForm = false;
          this.mostrarMensaje('Cliente guardado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    }
  }

  eliminar(c: any) {
    this.service.eliminar(c.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Cliente inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(c: any) {
    this.service.restaurar(c.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Cliente restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  get filtrados() {
    return this.customers.filter(c =>
      c.nombre?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      c.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      c.telefono?.toLowerCase().includes(this.searchText.toLowerCase())
    );
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