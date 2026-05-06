import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent {

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