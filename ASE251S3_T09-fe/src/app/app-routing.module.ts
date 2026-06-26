import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductoListComponent } from './components/producto-list/producto-list.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },

  { path: 'productos', component: ProductoListComponent },
  { path: 'clientes', component: CustomerListComponent },
  { path: 'proveedores', component: SupplierListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}