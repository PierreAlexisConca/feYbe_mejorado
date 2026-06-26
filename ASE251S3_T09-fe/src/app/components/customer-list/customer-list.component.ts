import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { PedidoService } from '../../services/pedido.service';
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
  clientesFrecuentes: any[] = [];
  clientesNormales: any[] = [];
  searchText = '';
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';
  filterType: 'todos' | 'frecuentes' | 'normales' = 'todos';
  showInactive = false;

  newCustomer = {
    nombre: '',
    email: '',
    telefono: ''
  };

  constructor(
    private service: CustomerService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe(data => {
      this.customers = data;
      this.clasificarClientes();
    });
  }

  clasificarClientes() {
    this.pedidoService.listar().subscribe(pedidos => {
      const fechasPorCliente = new Map<number, Date[]>();
      const ahora = new Date();
      const hace90Dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Filtrar solo pedidos activos
      const pedidosActivos = (pedidos || []).filter(p => this.esClienteActivo(p));

      pedidosActivos.forEach(p => {
        const clienteId = this.obtenerIdPedido(p);
        const fecha = this.parseFecha(p?.fecha);
        if (!clienteId || !fecha) {
          return;
        }

        const fechas = fechasPorCliente.get(clienteId) || [];
        fechas.push(fecha);
        fechasPorCliente.set(clienteId, fechas);
      });

      this.clientesFrecuentes = this.customers.filter(c => {
        const idCliente = this.obtenerIdCliente(c);
        if (!idCliente) {
          return false;
        }

        // Solo considerar clientes activos
        if (!this.verificarActivo(c)) {
          return false;
        }

        const fechas = (fechasPorCliente.get(idCliente) || []).sort((a, b) => a.getTime() - b.getTime());
        
        // Si tiene menos de 2 compras, no es frecuente
        if (fechas.length < 2) {
          return false;
        }

        let sumaDiasEntreCompras = 0;
        for (let i = 1; i < fechas.length; i++) {
          const diferencia = fechas[i].getTime() - fechas[i - 1].getTime();
          sumaDiasEntreCompras += Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));
        }

        const promedioDias = sumaDiasEntreCompras / (fechas.length - 1);
        
        // Contar compras en últimos 90 días
        const comprasUltimos90 = fechas.filter(f => f >= hace90Dias).length;

        // Frecuente: 
        // - Si compra cada 3-4 días en promedio Y tiene al menos 2 compras en 90 días
        // - O si tiene 3+ compras en total (independientemente de frecuencia)
        return (promedioDias <= 4 && comprasUltimos90 >= 2) || fechas.length >= 3;
      });

      this.clientesNormales = this.customers.filter(c => !this.clientesFrecuentes.includes(c));
    });
  }

  private verificarActivo(item: any): boolean {
    if (typeof item?.state === 'string') {
      return item.state.toUpperCase() === 'A';
    }
    if (typeof item?.state === 'boolean') {
      return item.state;
    }
    if (typeof item?.estado === 'boolean') {
      return item.estado;
    }
    return true;
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
    const customerId = this.obtenerIdCliente(c);
    if (!customerId) {
      this.mostrarMensaje('No se encontró el ID del cliente para inactivar.', 'error');
      return;
    }

    this.service.eliminar(customerId).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Cliente inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(c: any) {
    const customerId = this.obtenerIdCliente(c);
    if (!customerId) {
      this.mostrarMensaje('No se encontró el ID del cliente para restaurar.', 'error');
      return;
    }

    this.service.restaurar(customerId).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Cliente restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  get filtrados() {
    let lista = this.customers;
    
    if (this.filterType === 'frecuentes') {
      lista = this.clientesFrecuentes;
    } else if (this.filterType === 'normales') {
      lista = this.clientesNormales;
    }

    if (!this.showInactive) {
      lista = lista.filter(c => this.esClienteActivo(c));
    }
    
    return lista.filter(c =>
      c.nombre?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      c.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      c.telefono?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  esClienteActivo(customer: any): boolean {
    if (typeof customer?.estado === 'boolean') {
      return customer.estado;
    }

    if (typeof customer?.state === 'boolean') {
      return customer.state;
    }

    if (typeof customer?.state === 'string') {
      return customer.state.toUpperCase() === 'A';
    }

    return true;
  }

  private obtenerIdCliente(customer: any): number | null {
    const id = customer?.id ?? customer?.idCliente ?? customer?.clienteId;
    return typeof id === 'number' ? id : null;
  }

  private obtenerIdPedido(pedido: any): number | null {
    const id = pedido?.clienteId ?? pedido?.idCliente ?? pedido?.customerId;
    if (typeof id === 'number') {
      return id;
    }
    if (typeof id === 'string' && id.trim() !== '' && !Number.isNaN(Number(id))) {
      return Number(id);
    }
    return null;
  }

  private parseFecha(valor: any): Date | null {
    if (!valor) {
      return null;
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return null;
    }

    return fecha;
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