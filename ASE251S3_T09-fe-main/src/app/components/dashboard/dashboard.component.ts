import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  stats = [
    {
      title: 'Ventas Totales',
      value: 'S/. 24,500'
    },
    {
      title: 'Productos con Stock Bajo',
      value: '8'
    },
    {
      title: 'Clientes Frecuentes',
      value: '32'
    },
    {
      title: 'Proveedores Activos',
      value: '14'
    }
  ];

  recentOrders = [
    {
      client: 'Juan Pérez',
      product: 'Urea Agrícola',
      total: 240
    },
    {
      client: 'María López',
      product: 'Semilla de Maíz',
      total: 350
    }
  ];
}