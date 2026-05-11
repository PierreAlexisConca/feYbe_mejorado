import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.css'
})
export class PedidoListComponent {

  searchText = '';

  products = [
    {
      name: 'Laptop HP',
      category: 'Tecnología',
      stock: 15,
      price: 2500
    }
  ];

}