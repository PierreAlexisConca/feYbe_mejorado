import { Routes } from '@angular/router';

import { ProductoListComponent } from './components/producto-list/producto-list.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { PedidoFormComponent } from './components/pedido-form/pedido-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'productos',
    component: ProductoListComponent
  },

  {
    path: 'clientes',
    component: CustomerListComponent
  },

  {
    path: 'proveedores',
    component: SupplierListComponent
  },

  {
    path: 'pedidos',
    component: PedidoFormComponent
  }
];