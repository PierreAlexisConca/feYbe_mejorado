import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { ProductoListComponent } from './components/producto-list/producto-list.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { PedidoFormComponent } from './components/pedido-form/pedido-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: 'productos',
    component: ProductoListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'clientes',
    component: CustomerListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'proveedores',
    component: SupplierListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'pedidos',
    component: PedidoFormComponent,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
