import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent {
  @Output() proveedorGuardado = new EventEmitter<any>();
  
  @Input() set datosParaEditar(valor: any) {
    if (valor) { 
      // Al recibir datos para editar, nos aseguramos de copiar el objeto completo
      this.nuevoProveedor = { ...valor }; 
    }
  }

  // Sincronizado EXACTAMENTE con los nombres de tu clase Supplier.java
  nuevoProveedor: any = { 
    id: null,
    companyName: '',  // Cambiado de company-name a companyName
    ruc: '', 
    state: 'A', 
    cellPhone: '999999999', // Cambiado de cellphone a cellPhone
    contactName: '', // Cambiado de contact_name a contactName
    address: ''
  };

  enviarDatos() {
    // Verificamos que los campos obligatorios coincidan con los nuevos nombres
    if (this.nuevoProveedor.companyName && this.nuevoProveedor.ruc) {
      console.log('Enviando datos al Padre:', this.nuevoProveedor);
      this.proveedorGuardado.emit({ ...this.nuevoProveedor });
      this.resetForm();
    } else {
      alert("Por favor, llene el Nombre Comercial y el RUC");
    }
  }

  resetForm() {
    this.nuevoProveedor = { 
      id: null,
      companyName: '', 
      ruc: '', 
      state: 'A', 
      cellPhone: '999999999',
      contactName: '',
      address: ''
    };
  }
}