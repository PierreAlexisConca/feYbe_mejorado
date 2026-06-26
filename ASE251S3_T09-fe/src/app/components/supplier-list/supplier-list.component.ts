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
  showInactive = false;

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

    // Validaciones para RUC
    if (!/^(20\d{9})$/.test(payload.ruc)) {
      this.mostrarMensaje('El RUC debe tener 11 dígitos, empezar con 20 y solo números.', 'error');
      return;
    }
    // Validaciones para celular
    if (!/^9\d{8}$/.test(payload.cellPhone)) {
      this.mostrarMensaje('El celular debe tener 9 dígitos, empezar con 9 y solo números.', 'error');
      return;
    }
    // Validaciones para campos de texto (solo letras, espacios y tildes)
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    if (!soloLetras.test(payload.companyName)) {
      this.mostrarMensaje('El nombre de la empresa solo debe contener letras.', 'error');
      return;
    }
    if (!soloLetras.test(payload.contactName)) {
      this.mostrarMensaje('El nombre de contacto solo debe contener letras.', 'error');
      return;
    }
    if (!soloLetras.test(payload.address)) {
      this.mostrarMensaje('La dirección solo debe contener letras.', 'error');
      return;
    }
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
    const supplierId = this.obtenerIdProveedor(s);
    if (!supplierId) {
      this.mostrarMensaje('No se encontró el ID del proveedor para inactivar.', 'error');
      return;
    }

    this.service.eliminar(supplierId).subscribe(() => {
      this.cargar();
    });
  }

  restaurar(s: any) {
    const supplierId = this.obtenerIdProveedor(s);
    if (!supplierId) {
      this.mostrarMensaje('No se encontró el ID del proveedor para restaurar.', 'error');
      return;
    }

    this.service.restaurar(supplierId).subscribe(() => {
      this.cargar();
    });
  }

  get filtrados() {
    return this.suppliers.filter(supplier => {
      // Filtrar por estado (activo/inactivo)
      const estadoValido = this.showInactive ? true : this.esProveedorActivo(supplier);
      
      // Filtrar por búsqueda
      const textoValido = 
        supplier.companyName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        supplier.contactName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        supplier.ruc?.toLowerCase().includes(this.searchText.toLowerCase());
      
      return estadoValido && textoValido;
    });
  }

  esProveedorActivo(supplier: any): boolean {
    if (typeof supplier?.estado === 'boolean') {
      return supplier.estado;
    }

    if (typeof supplier?.state === 'boolean') {
      return supplier.state;
    }

    if (typeof supplier?.state === 'string') {
      return supplier.state.toUpperCase() === 'A';
    }

    return true;
  }

  private obtenerIdProveedor(supplier: any): number | null {
    const id = supplier?.id ?? supplier?.idSupplier ?? supplier?.supplierId;
    return typeof id === 'number' ? id : null;
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