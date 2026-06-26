import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats = [
    {
      title: 'Ventas Totales',
      value: 'S/. 0.00',
      icon: '💰'
    },
    {
      title: 'Productos con Stock Bajo',
      value: '0',
      icon: '📦'
    },
    {
      title: 'Clientes Frecuentes',
      value: '0',
      icon: '👥'
    },
    {
      title: 'Proveedores Activos',
      value: '0',
      icon: '🚚'
    }
  ];

  recentOrders = [];
  private refresSubscription: Subscription | null = null;

  constructor(
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private customerService: CustomerService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.cargarDatos();
    // Recargar datos cada 5 segundos para mantener el dashboard actualizado
    this.refresSubscription = interval(5000).subscribe(() => {
      this.cargarDatos();
    });
  }

  ngOnDestroy() {
    if (this.refresSubscription) {
      this.refresSubscription.unsubscribe();
    }
  }

  cargarDatos() {
    // Cargar TODOS los datos en paralelo para evitar nidificación
    
    // 1. PEDIDOS - calcular ventas totales y pedidos recientes
    this.pedidoService.listar().subscribe(pedidos => {
      const pedidosActivos = (pedidos || []).filter(p => this.esActivo(p));

      // Calcular ventas totales - sumar los totales exactos
      const ventasTotales = pedidosActivos.reduce((sum, p) => {
        const total = Number(p.total) || 0;
        return sum + total;
      }, 0);
      this.stats[0].value = `S/. ${ventasTotales.toFixed(2)}`;

      // Filtrar pedidos de los últimos 3 días para "Pedidos Recientes"
      const hoy = new Date();
      const hace3Dias = new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      this.recentOrders = pedidosActivos
        .filter(p => {
          const fechaPedido = new Date(p.fecha);
          return fechaPedido >= hace3Dias && fechaPedido <= hoy;
        })
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10);
    });

    // 2. PRODUCTOS - identificar stock bajo
    this.productoService.listar().subscribe(productos => {
      const stockBajo = productos.filter(p => this.esActivo(p) && (Number(p.stock) || 0) < 10).length;
      this.stats[1].value = stockBajo.toString();
    });

    // 3. CLIENTES FRECUENTES - contar clientes activos con pedidos
    this.customerService.listar().subscribe(clientes => {
      this.pedidoService.listar().subscribe(pedidos => {
        const clientesActivos = (clientes || []).filter(c => this.esActivo(c));
        const pedidosActivos = (pedidos || []).filter(p => this.esActivo(p));
        const ahora = new Date();
        const hace90Dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
        const fechasPorCliente = new Map<number, Date[]>();

        pedidosActivos.forEach(p => {
          const clienteId = this.obtenerIdPedidoCliente(p);
          const fecha = this.parseFecha(p?.fecha);
          if (!clienteId || !fecha) {
            return;
          }

          const fechas = fechasPorCliente.get(clienteId) || [];
          fechas.push(fecha);
          fechasPorCliente.set(clienteId, fechas);
        });

        const frecuentes = clientesActivos.filter(c => {
          const clienteId = this.obtenerIdCliente(c);
          if (!clienteId) {
            return false;
          }

          const fechas = (fechasPorCliente.get(clienteId) || []).sort((a, b) => a.getTime() - b.getTime());
          return this.esClienteFrecuente(fechas, hace90Dias);
        });

        this.stats[2].value = frecuentes.length.toString();
      });
    });

    // 4. PROVEEDORES ACTIVOS - contar proveedores con state='A'
    this.supplierService.listar().subscribe(proveedores => {
      const activosCount = (proveedores || []).filter(p => this.esActivo(p)).length;
      this.stats[3].value = activosCount.toString();
    });
  }

  private esActivo(item: any): boolean {
    if (!item) return false;
    
    // Buscar state en diferentes campos posibles
    const state = item?.state ?? item?.estado;
    
    if (typeof state === 'boolean') {
      return state;
    }
    
    if (typeof state === 'string') {
      return state.toUpperCase() === 'A';
    }
    
    // Si no hay state, asumir activo (para compatibilidad)
    return true;
  }

  private obtenerIdCliente(cliente: any): number | null {
    const id = cliente?.id ?? cliente?.idCliente ?? cliente?.clienteId;
    if (typeof id === 'number') {
      return id;
    }
    if (typeof id === 'string' && id.trim() !== '' && !Number.isNaN(Number(id))) {
      return Number(id);
    }
    return null;
  }

  private obtenerIdPedidoCliente(pedido: any): number | null {
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

  private esClienteFrecuente(fechasOrdenadas: Date[], hace90Dias: Date): boolean {
    if (fechasOrdenadas.length < 2) {
      return false;
    }

    let sumaDiasEntreCompras = 0;
    for (let i = 1; i < fechasOrdenadas.length; i++) {
      const diferencia = fechasOrdenadas[i].getTime() - fechasOrdenadas[i - 1].getTime();
      sumaDiasEntreCompras += Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));
    }

    const promedioDias = sumaDiasEntreCompras / (fechasOrdenadas.length - 1);
    const comprasUltimos90 = fechasOrdenadas.filter(f => f >= hace90Dias).length;

    return (promedioDias <= 4 && comprasUltimos90 >= 2) || fechasOrdenadas.length >= 3;
  }
}