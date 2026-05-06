import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../services/supplier.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.css'
})
export class SupplierListComponent implements OnInit {

  suppliers: any[] = [];
  searchText = '';
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  newSupplier = {
    ruc: '',
    cellPhone: '',
    companyName: '',
    contactName: '',
    address: ''
  };

  constructor(private service: SupplierService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe(data => this.suppliers = data);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editando = null;
      this.newSupplier = { ruc: '', cellPhone: '', companyName: '', contactName: '', address: '' };
    }
  }

  editar(s: any) {
    this.editando = s;
    this.newSupplier = { ruc: s.ruc, cellPhone: s.cellPhone, companyName: s.companyName, contactName: s.contactName, address: s.address };
    this.showForm = true;
  }

  guardar() {
    const payload = {
      ruc: this.newSupplier.ruc.trim(),
      cellPhone: this.newSupplier.cellPhone.trim(),
      companyName: this.newSupplier.companyName.trim(),
      contactName: this.newSupplier.contactName.trim(),
      address: this.newSupplier.address.trim()
    };

    if (!payload.ruc || !payload.cellPhone || !payload.companyName || !payload.contactName || !payload.address) {
      this.mostrarMensaje('Completa todos los campos del proveedor.', 'error');
      return;
    }

    if (this.editando) {
      this.service.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargar();
          this.editando = null;
          this.newSupplier = { ruc: '', cellPhone: '', companyName: '', contactName: '', address: '' };
          this.showForm = false;
          this.mostrarMensaje('Proveedor actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.service.crear(payload).subscribe({
        next: () => {
          this.cargar();
          this.newSupplier = { ruc: '', cellPhone: '', companyName: '', contactName: '', address: '' };
          this.showForm = false;
          this.mostrarMensaje('Proveedor guardado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    }
  }

  eliminar(s: any) {
    this.service.eliminar(s.id).subscribe(() => {
      this.cargar();
    });
  }

  restaurar(s: any) {
    this.service.restaurar(s.id).subscribe(() => {
      this.cargar();
    });
  }

  get filtrados() {
    return this.suppliers.filter(supplier =>
      supplier.companyName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      supplier.ruc?.toLowerCase().includes(this.searchText.toLowerCase())
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