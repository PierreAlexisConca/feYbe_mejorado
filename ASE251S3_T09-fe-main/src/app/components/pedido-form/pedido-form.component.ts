import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-form.component.html',
  styleUrl: './pedido-form.component.css'
})
export class PedidoFormComponent implements OnInit {

  pedidos: any[] = [];
  searchText = '';
  showForm = false;
  editando: any = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  pedido = {
    fecha: '',
    total: 0
  };

  constructor(private service: PedidoService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe(data => this.pedidos = data);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editando = null;
      this.pedido = { fecha: '', total: 0 };
    }
  }

  editar(p: any) {
    this.editando = p;
    this.pedido = { fecha: p.fecha, total: p.total };
    this.showForm = true;
  }

  guardarPedido() {
    const payload = {
      fecha: this.pedido.fecha,
      total: Number(this.pedido.total)
    };

    if (!payload.fecha || Number.isNaN(payload.total)) {
      this.mostrarMensaje('Completa fecha y total del pedido.', 'error');
      return;
    }

    if (this.editando) {
      this.service.actualizar(this.editando.id, payload).subscribe({
        next: () => {
          this.cargar();
          this.editando = null;
          this.pedido = { fecha: '', total: 0 };
          this.showForm = false;
          this.mostrarMensaje('Pedido actualizado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    } else {
      this.service.crear(payload).subscribe({
        next: () => {
          this.cargar();
          this.pedido = { fecha: '', total: 0 };
          this.showForm = false;
          this.mostrarMensaje('Pedido guardado con exito.', 'ok');
        },
        error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
      });
    }
  }

  eliminar(p: any) {
    this.service.eliminar(p.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Pedido inactivado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  restaurar(p: any) {
    this.service.restaurar(p.id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarMensaje('Pedido restaurado con exito.', 'ok');
      },
      error: (error) => this.mostrarMensaje(this.extraerMensajeError(error), 'error')
    });
  }

  pedidosFiltrados() {
    const filtro = this.searchText.toLowerCase();

    return this.pedidos.filter(pedido =>
      pedido.fecha?.toLowerCase().includes(filtro) ||
      pedido.total?.toString().includes(filtro)
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